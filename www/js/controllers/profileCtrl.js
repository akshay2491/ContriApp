angular.module('starter')

.controller('profileCtrl', function($scope, File, $rootScope, $cordovaToast, loadingScreen, $ionicHistory, $ionicPlatform, $state, $localstorage, $mdBottomSheet, $cordovaCamera) {
  var profileUser = {};
  $scope.profileUser = {};
  $scope.isFieldEnabled = true;
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
    $scope.isFieldEnabled = false;
    $scope.isSubmit = false;
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
            if (user.hasOwnProperty('password')) {
              result.set('password', user.password);
            }
            result.save(null, {
              success: function(res) {
                loadingScreen.hideNotification();
                $scope.isFieldEnabled = true;
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
      var query = new Parse.Query(Parse.User);
      query.equalTo('objectId', $rootScope.currentUser.id);
      query.first({
        success: function(result) {
          //result.set("image",parseFile);
          result.set('name', user.name);
          result.set('email', user.emailId);
          result.set('image', temp);
          if (user.hasOwnProperty('password')) {
            result.set('password', user.password);
          }
          result.save(null, {
            success: function(res) {
              loadingScreen.hideNotification();
              $scope.isFieldEnabled = true;
              $scope.isSubmit = true;
              $cordovaToast.show('Profile Updated.Please Login Again', 'short', 'bottom');
              $rootScope.currentUser = res;
              $scope.$apply();
            }
          })
        }
      })
      
    }
    
    //var query = new Parse.Query(Parse.User);
    //query.equalTo('objectId', $rootScope.currentUser.id);
    /*query.first({
                        success: function(result) {
                            //result.set("image",parseFile);
                            result.set('name', user.name);
                            result.set('email', user.emailId);
                            if (user.hasOwnProperty('password')) {
                                result.set('password', user.password);
                            }
                            result.save(null, {
                                success: function(res) {
                                    loadingScreen.hideNotification();
                                    $scope.isFieldEnabled = true;
                                    $scope.isSubmit = true;
                                    $cordovaToast.show('Profile Updated','short','bottom');
                                    $rootScope.currentUser = res;
                                    $scope.$apply();
                                }
                            })
                        }
                    })*/
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