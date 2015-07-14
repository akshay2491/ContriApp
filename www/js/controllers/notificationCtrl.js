angular.module('starter')

.controller('notificationCtrl', function($scope, $rootScope) {

    $scope.declineTrip = function(user) {
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
                                $cordovaToast.show('Trip Declined', 'short', 'bottom');
                            }
                        });
                    }
                });
            }
        }
    }

    $scope.confirmTrip = function(user) {
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
                                                $cordovaToast.show('Trip Confirmed', 'short', 'bottom');
                                            }
                                        });
                                    }
                                });
                            }
                        })
                    }
                });
            }
        }
    }
});