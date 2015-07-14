angular.module('starter')

.controller('DashCtrl', function($scope, $state, $cordovaToast, $rootScope, $ionicHistory, $ionicModal, $ionicLoading, loadingScreen) {
    /*$ionicHistory.clearCache();
      $ionicHistory.clearHistory();*/

    var userDetails = [];
    $scope.expensesItem = [];
    $rootScope.notificationObj = [];

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
});