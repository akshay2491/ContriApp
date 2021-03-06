angular.module('starter')

.controller('profileCtrl', function($scope, File, $rootScope, $cordovaToast, loadingScreen, $ionicHistory, $ionicPlatform, $state, $localstorage,  $cordovaCamera, $ionicActionSheet) {
        var profileUser = {};
        $scope.profileUser = {};
        $scope.isFieldEnabled = true;
        $scope.changePass = {
            val: false
        };
        $scope.tempVar = false;
        profileUser.id = $rootScope.currentUser.id;
        profileUser.name = $rootScope.currentUser.attributes.name;
        profileUser.userName = $rootScope.currentUser.attributes.username;
        profileUser.emailId = $rootScope.currentUser.attributes.email;
        if ($rootScope.currentUser.attributes.image == undefined) {
            profileUser.pictureUrl = 'http://placehold.it/100x100';
        } else {
            profileUser.pictureUrl = $rootScope.currentUser.attributes.image;
        }
        $scope.profileUser = profileUser;
        $scope.isSubmit = true;
        //$scope.pictureUrl = 'http://placehold.it/200x200';
        $scope.editFields = function() {
            $scope.tempVar = true;
            $scope.isFieldEnabled = false;
            $scope.isSubmit = false;
        }

        if(typeof analytics !== 'undefined') {
            analytics.trackView('Profile');
        }


        $scope.changeUserEmail = function(email) {
            if ($scope.profileUser.emailId) {
                loadingScreen.showNotification();
                var query = new Parse.Query(Parse.User);
                query.equalTo('email', email);
                query.find({
                    success: function(results) {
                        if (results.length == 0) {
                            loadingScreen.hideNotification();
                            $scope.errorEmailMsg = '';
                            $scope.$apply();
                        } else {
                            if (results[0].id != $rootScope.currentUser.id) {
                                loadingScreen.hideNotification();
                                $scope.errorEmailMsg = 'Email id is Registered.';
                                $scope.$apply();
                            } else {
                                loadingScreen.hideNotification();
                                $scope.errorEmailMsg = '';
                                $scope.$apply();
                            }
                        }
                    },
                    error: function(errorMsg) {
                        loadingScreen.hideNotification();
                        if(errorMsg.code == 100){
                            $cordovaToast.show('Cant verify Email id.Check your network', 'short', 'bottom');
                        }
                    }
                })
            }
        }

        $scope.clearerror = function() {
            $scope.errorEmailMsg = '';
        }


        $scope.uploadImage = function($event) {
               var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: 'Camera' },
       { text: 'Files' },
       {text:'Remove Photo'}
     ],
     titleText: '<b>Change your photo</b>',
     cancelText: 'Cancel',
     cancel: function() {
         
        },
     buttonClicked: function(index) {
        if (index == 0) {
                    $scope.loadCamera();
                    return true;
                    //$scope.getPictureFromSys();
                }
                if (index == 1) {
                    $scope.loadFileSystem();
                    return true;
                }
                if (index == 2) {
                    $scope.removePhoto();
                    return true;
                }
     }
   });
        }

        $scope.removePhoto = function() {
            $scope.profileUser.pictureUrl = 'http://placehold.it/100x100';
        }


        $ionicPlatform.ready(function() {

            $scope.loadCamera = function() {

                var options = {
                    quality: 100,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 100,
                    cameraDirection: 1,
                    targetHeight: 100,
                    saveToPhotoAlbum: false
                };

                $cordovaCamera.getPicture(options).then(function(imageData) {

                    $scope.profileUser.pictureUrl = "data:image/jpeg;base64," + imageData;
                });
            }

            $scope.loadFileSystem = function() {
                var options = {
                    quality: 100,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 100,
                    targetHeight: 100
                };

                $cordovaCamera.getPicture(options).then(function(imageData) {
                    $scope.profileUser.pictureUrl = "data:image/jpeg;base64," + imageData;
                })
            }
        });


        $scope.updateFields = function(user) {
            if ($scope.changePass.val) {
                if ($scope.profileUser.password != $scope.profileUser.cPassword) {
                    alertPopup.showPopup('Your Password is not Matching');
                } else {
                    loadingScreen.showNotification();
                    var temp = user.pictureUrl;
                    if (temp.indexOf("data:image/jpeg;base64,") > -1) {
                        temp = temp.replace('data:image/jpeg;base64,', '');
                        File.upload(temp).success(function(data) {
                            var image = data.url;
                            var query = new Parse.Query(Parse.User);
                            query.equalTo('objectId', $rootScope.currentUser.id);
                            query.first({
                                success: function(result) {
                                    //result.set("image",parseFile);
                                    result.set('name', user.name);
                                    result.set('email', user.emailId);
                                    result.set('image', image);
                                    result.set('password', user.password);
                                    result.save(null, {
                                        success: function(res) {
                                            loadingScreen.hideNotification();
                                            $rootScope.updateAUser(res);
                                            
                                            $scope.isFieldEnabled = true;
                                            $scope.tempVar = false;
                                            $scope.changePass.val = false;
                                            $scope.isSubmit = true;
                                            $cordovaToast.show('Profile Updated.', 'short', 'bottom');
                                            $rootScope.currentUser = res;
                                            
                                            $scope.$apply();

                                        },
                                        error: function(errorMsg) {
                                            loadingScreen.hideNotification();
                                            if(errorMsg.code == 100){
                                                $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                                            }
                                        }
                                    })
                                },
                                error: function(errorMsg) {
                                    loadingScreen.hideNotification();
                                    if(errorMsg.code == 100){
                                        $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                                    }
                                }
                            })
                        });
                    } else {
                        loadingScreen.showNotification();
                        var query = new Parse.Query(Parse.User);
                        query.equalTo('objectId', $rootScope.currentUser.id);
                        query.first({
                            success: function(result) {
                                //result.set("image",parseFile);
                                result.set('name', user.name);
                                result.set('email', user.emailId);
                                result.set('image', temp);
                                result.set('password', user.password);
                                result.save(null, {
                                    success: function(res) {
                                        loadingScreen.hideNotification();
                                        $rootScope.updateAUser(res);
                                        
                                        $scope.isFieldEnabled = true;
                                        $scope.tempVar = false;
                                        $scope.changePass.val = false;
                                        $scope.isSubmit = true;
                                        $cordovaToast.show('Profile Updated.', 'short', 'bottom');
                                        $rootScope.currentUser = res;
                                        
                                        $scope.$apply();
                                    }
                                })
                            },
                            error: function(errorMsg) {
                                loadingScreen.hideNotification();
                                if(errorMsg.code == 100){
                                    $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                                }
                            }
                        })

                    }
                }
            } else {
                loadingScreen.showNotification();
                var temp = user.pictureUrl;
                if (temp.indexOf("data:image/jpeg;base64,") > -1) {
                    temp = temp.replace('data:image/jpeg;base64,', '');
                    File.upload(temp).success(function(data) {
                        var image = data.url;
                        var query = new Parse.Query(Parse.User);
                        query.equalTo('objectId', $rootScope.currentUser.id);
                        query.first({
                            success: function(result) {
                                //result.set("image",parseFile);
                                result.set('name', user.name);
                                result.set('email', user.emailId);
                                result.set('image', image);
                                result.save(null, {
                                    success: function(res) {
                                        loadingScreen.hideNotification();
                                        $rootScope.updateAUser(res);
                                        
                                        $scope.isFieldEnabled = true;
                                        $scope.tempVar = false;
                                        $scope.isSubmit = true;
                                        $cordovaToast.show('Profile Updated.', 'short', 'bottom');
                                        $rootScope.currentUser = res;
                                        
                                        $scope.$apply();
                                    },
                                    error: function(errorMsg) {
                                        loadingScreen.hideNotification();
                                        if(errorMsg.code == 100){
                                            $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                                        }
                                    }
                                })
                            },
                            error: function(errorMsg) {
                                loadingScreen.hideNotification();
                                if(errorMsg.code == 100){
                                    $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                                }
                            }
                        })
                    });
                } else {
                    loadingScreen.showNotification();
                    var query = new Parse.Query(Parse.User);
                    query.equalTo('objectId', $rootScope.currentUser.id);
                    query.first({
                        success: function(result) {
                            //result.set("image",parseFile);
                            result.set('name', user.name);
                            result.set('email', user.emailId);
                            result.set('image', temp);
                            result.save(null, {
                                success: function(res) {
                                    loadingScreen.hideNotification();
                                    $rootScope.updateAUser(res);
                                    
                                    $scope.isFieldEnabled = true;
                                    $scope.tempVar = false;
                                    $scope.isSubmit = true;
                                    $cordovaToast.show('Profile Updated.', 'short', 'bottom');
                                    $rootScope.currentUser = res;

                                    $scope.$apply();
                                },
                                error: function(errorMsg) {
                                    loadingScreen.hideNotification();
                                   if(errorMsg.code == 100){
                                        $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                                    }
                                }
                            })
                        },
                        error: function(errorMsg) {
                            loadingScreen.hideNotification();
                            if(errorMsg.code == 100){
                                $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                            }
                        }
                    })
                }
            }

        }
      
    });
    