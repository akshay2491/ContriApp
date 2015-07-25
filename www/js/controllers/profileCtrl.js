angular.module('starter')

.controller('profileCtrl', function($scope, File, $rootScope, $cordovaToast, loadingScreen, $ionicHistory, $ionicPlatform, $state, $localstorage, $mdBottomSheet, $cordovaCamera, $mdDialog) {
        var profileUser = {};
        $scope.profileUser = {};
        $scope.isFieldEnabled = true;
        $scope.changePass = {
            val: false
        };
        $scope.tempVar = false;
        console.log($rootScope.currentUser)
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

        /*$scope.$watch('profileUser.cPassword', function(oldName, newVal) {
            console.log('in')
            if ($scope.profileUser.cPassword) {
                if ($scope.profileUser.password === $scope.profileUser.cPassword) {
                    $scope.mismatchPassword = 'Perfect';
                } else {
                    $scope.mismatchPassword = 'Password Not Matching';

                }
            }
        })*/

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
                    }
                })
            }
        }

        $scope.clearerror = function() {
            $scope.errorEmailMsg = '';
        }


        $scope.uploadImage = function($event) {
            $mdBottomSheet.show({
                templateUrl: 'templates/bottom-sheet.html',
                controller: 'bottomSheetCtrl',
                targetEvent: $event
            }).then(function(result) {
                if (result.name === 'Camera') {
                    $scope.loadCamera();
                    //$scope.getPictureFromSys();
                }
                if (result.name === 'Files') {
                    $scope.loadFileSystem();
                }
                if (result.name === 'Remove Photo') {
                    $scope.removePhoto();
                }
            })
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
                    $mdDialog.show(
                        $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .title('This is an alert title')
                        .content('Your Password is not Matching')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('Got it!')
                    );
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
                                            $scope.isFieldEnabled = true;
                                            $scope.tempVar = false;
                                            $scope.changePass.val = false;
                                            $scope.isSubmit = true;
                                            $cordovaToast.show('Profile Updated.Please Login Again', 'short', 'bottom');
                                            $rootScope.currentUser = res;
                                            $scope.$apply();
                                        }
                                    })
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
                                        $scope.isFieldEnabled = true;
                                        $scope.tempVar = false;
                                        $scope.changePass.val = false;
                                        $scope.isSubmit = true;
                                        $cordovaToast.show('Profile Updated.Please Login Again', 'short', 'bottom');
                                        $rootScope.currentUser = res;
                                        $scope.$apply();
                                    }
                                })
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
                                        $scope.isFieldEnabled = true;
                                        $scope.tempVar = false;
                                        $scope.isSubmit = true;
                                        $cordovaToast.show('Profile Updated.Please Login Again', 'short', 'bottom');
                                        $rootScope.currentUser = res;
                                        $scope.$apply();
                                    }
                                })
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
                                    $scope.isFieldEnabled = true;
                                    $scope.tempVar = false;
                                    $scope.isSubmit = true;
                                    $cordovaToast.show('Profile Updated.Please Login Again', 'short', 'bottom');
                                    $rootScope.currentUser = res;
                                    $scope.$apply();
                                }
                            })
                        }
                    })
                }
            }

        }

        $scope.logOutUser = function() {
            $localstorage.deleteObject('User');
            $rootScope.currentUser = null;
            $rootScope.notificationObj = [];
            Parse.User.logOut();
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $state.go('login');
        }
    })
    .controller('bottomSheetCtrl', function($scope, $rootScope, $mdBottomSheet) {
        $scope.items = [{
            name: 'Camera',
            classStyle: 'icon ion-camera'
        }, {
            name: 'Files',
            classStyle: 'icon ion-image'
        }, {
            name: 'Remove Photo',
            classStyle: 'icon ion-trash-b'
        }];
        $scope.listItemClick = function($index) {
            var clickedItem = $scope.items[$index];
            $mdBottomSheet.hide(clickedItem);
        };
    });