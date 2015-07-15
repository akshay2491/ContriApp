angular.module('starter')

.controller('MainCtrl', function($scope, $rootScope, $state) {
    $rootScope.userDetails = [];
    $rootScope.currentUser = Parse.User.current();

    $rootScope.getAllUsers = function() {
        var userDetails = [];
        var query = new Parse.Query(Parse.User);
        query.find({
            success: function(results) {
                _.each(results, function(user) {
                    userDetails.push({
                        'id': user.id,
                        'name': user.attributes.name,
                        'userName': user.attributes.username,
                        'image': user.attributes.image
                    });
                });
                $rootScope.userDetails = userDetails;
                $scope.$apply();
            }
        })
    }

    $rootScope.getNotification = function() {
        $rootScope.notificationObj = [];
        var query = new Parse.Query('notification');
        query.equalTo('userTripId', $rootScope.currentUser.id);
        query.find({
            success: function(results) {
                if (results.length != 0) {
                    _.each(results, function(individual) {
                        _.each($rootScope.userDetails, function(user) {
                            if (user.id === individual.attributes.parent) {
                                $rootScope.notificationObj.push({
                                    'id': individual.id,
                                    'createdBy': user.name,
                                    'tripName': individual.attributes.name,
                                    'tripId': individual.attributes.tripId,
                                    'image': user.image,
                                    'confirmed': individual.attributes.confirmed
                                });
                                $scope.$broadcast('scroll.refreshComplete');
                                //loadingScreen.hideNotification();
                                $scope.$apply();
                            }
                        })
                    })
                } else {
                    //loadingScreen.hideNotification();
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.$apply();
                }
            }
        })
    }

    $rootScope.gotoPage = function(val) {
        $state.go(val);
    }
    
});