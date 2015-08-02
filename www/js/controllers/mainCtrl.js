angular.module('starter')

.controller('MainCtrl', function($scope, $rootScope, $state, $cordovaToast) {
    $rootScope.userDetails = [];
    $rootScope.currentUser = Parse.User.current();

    if(typeof analytics !== 'undefined') {
            analytics.trackView('Main');
        }

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
            },
            error: function(errorMsg) {
                //$cordovaToast.show('Couldnt fetch User', 'short', 'bottom');
            }
        })
    }

    $rootScope.updateAUser =function(user) {
        if($rootScope.userDetails.length != 0) {
            for(var i =0 ;i<$rootScope.userDetails.length;i++) {
                if($rootScope.userDetails[i].id === user.id) {
                    $rootScope.userDetails[i].id = user.id;
                    $rootScope.userDetails[i].name = user.attributes.name;
                    $rootScope.userDetails[i].image = user.attributes.image;
                    return;
                }
            }
        }
    }

    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
        $state.go('loading');
    });

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
            },
            error: function(errorMsg) {
                $cordovaToast.show('Couldnt fetch notification', 'short', 'bottom');
            }
        })
    }

    $rootScope.gotoPage = function(val) {
        $state.go(val);
    }

});