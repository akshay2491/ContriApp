angular.module('starter')

.controller('summaryCtrl', function($scope, $cordovaToast, $rootScope, Data, mySharedService, $state, loadingScreen) {
        $scope.isRead = false;

        $scope.$on('$ionicView.loaded', function() {

            $scope.findTripForMember();
        });

        if(typeof analytics !== 'undefined') {
            analytics.trackView('Summary');
        }

        $scope.getExpensesDetails = function() {
            $scope.users = [];
            var expObj = Parse.Object.extend('expenses');
            var query = new Parse.Query(expObj);
            var finalArray = [],
                finalId = [];

            query.find({
                success: function(results) {
                    for (var i = 0; i < results.length; i++) {
                        finalArray.push({
                            'id': results[i].attributes.parent,
                            'exp': results[i].attributes.amount,
                            'expName': results[i].attributes.name
                        });
                        //finalId.push(results[i].attributes.parent);
                    }
                    $scope.users = Data.calculateSummary(finalArray, $rootScope.userDetails);
                    //$scope.$broadcast('scroll.refreshComplete');
                    $scope.isRead = true;
                    $scope.$apply();
                }
            });
        }

        $scope.findTripForMember = function() {
            loadingScreen.showNotification();
            var tripsArray = [];
            var query = new Parse.Query('trips');
            query.equalTo('members', $rootScope.currentUser.id);
            query.find({
                success: function(results) {
                    _.each(results, function(arr) {
                        var createdBy = '';
                        for (var i = 0; i < $rootScope.userDetails.length; i++) {
                            if (arr.attributes.parent === $rootScope.userDetails[i].id) {
                                createdBy = $rootScope.userDetails[i].name;
                            }
                        }
                        tripsArray.push({
                            'id': arr.id,
                            'name': arr.attributes.name,
                            'members': arr.attributes.members,
                            'createdBy': createdBy,
                            'date': arr.attributes.date,
                            'currency':arr.attributes.currency,
                            'members': arr.attributes.members
                        });
                    });
                    $scope.tripsArray = tripsArray;
                    loadingScreen.hideNotification();
                    //$scope.$broadcast('scroll.refreshComplete');
                    $scope.$apply();
                    //console.log(results);
                },
                error: function(errorMsg) {
                    loadingScreen.hideNotification();
                    //$scope.$broadcast('scroll.refreshComplete');
                    $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                }
            });
        }

        $scope.getExpenseFromTrip = function(tripObj) {
            loadingScreen.showNotification();
            var expensesItems = [];
            var userDetails = [];
            var query = new Parse.Query('expenses');
            query.equalTo('tripId', tripObj.id);
            query.find({
                success: function(results) {
                    for (var i = 0; i < results.length; i++) {
                        var createdBy = '';
                        for (var j = 0; j < $rootScope.userDetails.length; j++) {
                            if (results[i].attributes.parent === $rootScope.userDetails[j].id) {
                                createdBy = $rootScope.userDetails[j].name;
                            }
                        }
                        //finalArray.push({'id':results[i].attributes.parent,'exp':results[i].attributes.amount,'expName':results[i].attributes.name});
                        expensesItems.push({
                            'id': results[i].attributes.parent,
                            'expName': results[i].attributes.name,
                            'exp': results[i].attributes.amount,
                            'date': results[i].updatedAt,
                            'createdBy': createdBy
                        });
                    }
                    _.each(tripObj.members, function(user) {
                        _.each($rootScope.userDetails, function(members) {
                            if (members.id === user) {
                                userDetails.push({
                                    'id': user,
                                    'name': members.name,
                                    'image': members.image
                                });
                            }
                        })
                    })
                    loadingScreen.hideNotification();
                    var imp = Data.calculateSummary(expensesItems, userDetails);
                    mySharedService.prepForExpSummary(imp,tripObj.currency);
                    $state.go('external');
                    $scope.$apply();
                },
                error: function(err) {
                    loadingScreen.hideNotification();
                    if(err.code == 100) {
                        $cordovaToast.show('Connection Failed.','short','bottom');
                    }
                }
            });
        }
    })
    .controller('sumExpCtrl', function($scope, $rootScope, mySharedService) {
        $scope.users = mySharedService.exp;
        $scope.currencyForSummary = mySharedService.currency;
    });