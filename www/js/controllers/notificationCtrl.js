angular.module('starter')

.controller('notificationCtrl', function($scope, $rootScope, $cordovaToast, loadingScreen,$ionicActionSheet) {

    $scope.showBottomSheet=function(user) {

        var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: 'Confirm' },
       { text: 'Reject' }
     ],
     titleText: '<b>Options</b>',
     cancelText: 'Cancel',
     cancel: function() {
         
        },
     buttonClicked: function(index) {
        if (index == 0) {
                    $scope.confirmTrip(user);
                    return true;
                    //$scope.getPictureFromSys();
                }
                if (index == 1) {
                    $scope.declineTrip(user);
                    return true;
                }
     }
   });

    }

    $scope.declineTrip = function(user) {
        loadingScreen.showNotification();
        for (var i = 0; i < $rootScope.notificationObj.length; i++) {
            if ($rootScope.notificationObj[i].id === user.id) {
                $rootScope.notificationObj[i].confirmed = true;
                var query = new Parse.Query('notification');
                query.equalTo('objectId', $rootScope.notificationObj[i].id);
                $rootScope.notificationObj.splice(user, 1);
                query.find({
                    success: function(results) {
                        results[0].destroy({
                            success: function(res) {
                                loadingScreen.hideNotification();
                                $cordovaToast.show('Event Declined', 'short', 'bottom');
                            }
                        });
                    },
                    error: function(errorMsg) {
                        loadingScreen.hideNotification();
                        //$scope.$broadcast('scroll.refreshComplete');
                        if(errorMsg.code == 100){
                        $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                    }
                    }
                });
            }
        }
    }

    $scope.confirmTrip = function(user) {
        loadingScreen.showNotification();
        for (var i = 0; i < $rootScope.notificationObj.length; i++) {
            if ($rootScope.notificationObj[i].id === user.id) {
                $rootScope.notificationObj[i].confirmed = true;
                var query = new Parse.Query('notification');
                query.equalTo('objectId', $rootScope.notificationObj[i].id);
                $rootScope.notificationObj.splice(user, 1);
                query.find({
                    success: function(results) {
                        var newQuery = new Parse.Query('trips');
                        newQuery.equalTo('objectId', results[0].attributes.tripId);
                        newQuery.equalTo('parent', results[0].attributes.parent);
                        newQuery.first({
                            success: function(result) {
                                var arr = result.attributes.members;
                                arr.push(results[0].attributes.userTripId);
                                result.set('members', arr);
                                result.save({
                                    success: function(res) {
                                        results[0].destroy({
                                            success: function(res) {
                                                loadingScreen.hideNotification();
                                                $cordovaToast.show('Event Confirmed', 'short', 'bottom');
                                            }
                                        });
                                    },
                                    error: function(errorMsg) {
                                        loadingScreen.hideNotification();
                                        //$scope.$broadcast('scroll.refreshComplete');
                                        if(errorMsg.code == 100){
                                            $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                                        }
                                    }
                                });
                            }
                        })
                    },
                    error: function(errorMsg) {
                        loadingScreen.hideNotification();
                        //$scope.$broadcast('scroll.refreshComplete');
                        if(errorMsg.code == 100){
                            $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                        }
                    }
                });
            }
        }
    }
});