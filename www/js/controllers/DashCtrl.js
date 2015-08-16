angular.module('starter')

.controller('DashCtrl', function($scope, $state, $cordovaToast, $rootScope, $ionicHistory, $ionicModal, $ionicLoading, loadingScreen,$localstorage) {
    /*$ionicHistory.clearCache();
      $ionicHistory.clearHistory();*/

    $scope.expensesItem = [];
    $rootScope.notificationObj = [];

    if(typeof analytics !== 'undefined') {
            analytics.trackView('Home');
        }

    $scope.$on('$ionicView.enter', function() {
        //loadingScreen.showNotification();
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        $rootScope.getNotification();
    });

    $scope.openNotification = function() {
        $state.go('notification');
        $cordovaToast.show('Pull to refresh', 'short', 'bottom');
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


});