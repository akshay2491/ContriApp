angular.module('starter')

.controller('expenseCtrl', function($scope, $ionicLoading, $cordovaToast, $ionicHistory, $state, $ionicPopover, $mdToast, $rootScope, loadingScreen, $mdDialog, mySharedService) {

        $scope.expensesItem = [];
        //$scope.loading = false;
        var expObj = Parse.Object.extend('expenses');

        $scope.$on('$ionicView.loaded', function() {
            $scope.findTripForMember();
        });

        if(typeof analytics !== 'undefined') {
            analytics.trackView('Expense');
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
                            'currency': arr.attributes.currency,
                            'date': arr.attributes.date
                        });
                    });
                    $scope.tripsArray = tripsArray;
                    loadingScreen.hideNotification();
                    $scope.$broadcast('scroll.refreshComplete');
                    $cordovaToast.show('Pull to Refresh', 'short', 'bottom');
                    $scope.$apply();
                    //console.log(results);
                },
                error: function(errorMsg) {
                    loadingScreen.hideNotification();
                    $scope.$broadcast('scroll.refreshComplete');
                    if(errorMsg.code == 100){
                        $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                    }
                }
            });
        }

        $scope.getExpenseFromTrip = function(index) {
            loadingScreen.showNotification();
            var expensesItems = [];
            var query = new Parse.Query('expenses');
            query.equalTo('tripId', $scope.tripsArray[index].id);
            query.find({
                success: function(results) {
                    for (var i = 0; i < results.length; i++) {
                        var createdBy = '';
                        for (var j = 0; j < $rootScope.userDetails.length; j++) {
                            if (results[i].attributes.parent === $rootScope.userDetails[j].id) {
                                createdBy = $rootScope.userDetails[j].name;
                            }
                        }
                        expensesItems.push({
                            'id': results[i].id,
                            'name': results[i].attributes.name,
                            'parentId': results[i].attributes.parent,
                            'amount': results[i].attributes.amount,
                            'date': results[i].updatedAt,
                            'createdBy': createdBy
                        });
                    }
                    mySharedService.prepForBroadcast(expensesItems, $scope.tripsArray[index].id,$scope.tripsArray[index].currency);
                    loadingScreen.hideNotification();
                    $state.go('internal.addExpense');
                    $scope.$apply();
                },
                error: function(errorMsg) {
                    loadingScreen.hideNotification();
                    $scope.$broadcast('scroll.refreshComplete');
                    if(errorMsg.code == 100){
                        $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                    }
                }
            });
        }

    })
    .controller('tripExpCtrl', function($scope, $cordovaToast, mySharedService, $mdDialog, $ionicPopover, $rootScope, $ionicModal, loadingScreen) {

        $scope.expensesItem = mySharedService.message;
        $scope.tripId = mySharedService.idVal;
        $scope.currencyForTrip = mySharedService.currency;
        $scope.$on('$ionicView.loaded', function() {
            $scope.getMembersOfTrip();
            $scope.membersNotConfirmed();
        });

        if(typeof analytics !== 'undefined') {
            analytics.trackView('Trip Expense');
        }


        $scope.openExpenseTab = function() {
            $scope.expenses = {};
            $scope.modal.show();
        };


        $scope.getMembersOfTrip = function() {
            var membersForExp = [];
            var query = new Parse.Query('trips');
            query.equalTo('objectId', $scope.tripId);
            query.first({
                success: function(result) {
                    _.each(result.attributes.members, function(user) {
                        _.each($rootScope.userDetails, function(list) {
                            if (user === list.id) {
                                membersForExp.push({
                                    'name': list.name,
                                    'username': list.userName,
                                    'image': list.image
                                });
                            }
                        })
                    })
                    $scope.membersForExp = membersForExp;
                    $scope.$apply();
                }
            });
        }

        $scope.membersNotConfirmed = function() {
            var membersForExpYetToConfirm = [];
            var query = new Parse.Query('notification');
            query.equalTo('tripId', $scope.tripId);
            query.find({
                success: function(results) {
                    _.each(results, function(user) {
                        _.each($rootScope.userDetails, function(list) {
                            if (user.attributes.userTripId === list.id) {
                                membersForExpYetToConfirm.push({
                                    'name': list.name,
                                    'username': list.userName,
                                    'image': list.image
                                });
                            }
                        })
                    })
                    $scope.membersForExpYetToConfirm = membersForExpYetToConfirm;
                    $scope.$apply();
                }
            })
        }


        $scope.getUserFromSearchForExpense = function(name) {
            $scope.hideErrorMsg = false;
            loadingScreen.showNotification();
            var resultUser = [];
            var query = new Parse.Query(Parse.User);
            query.find({
                success: function(results) {
                    _.each(results, function(user) {
                        if (user.attributes.name.toUpperCase() === name.name.toUpperCase() || user.attributes.username.toUpperCase() === name.name.toUpperCase()) {
                            var resultUserObj = {
                                name: '',
                                email: '',
                                id: ''
                            };
                            resultUserObj.name = user.attributes.name;
                            resultUserObj.email = user.attributes.username;
                            resultUserObj.image = user.attributes.image;
                            resultUserObj.isAdded = true;
                            resultUserObj.id = user.id;
                            resultUser.push(resultUserObj);
                        }
                    });
                    loadingScreen.hideNotification();
                    $scope.showUser = true;
                    if (resultUser.length == 0) {
                        $scope.hideErrorMsg = true;
                    }
                    $scope.resultUserForExpense = resultUser;
                    $scope.$apply();
                },
                error: function(errorMsg) {
                    loadingScreen.hideNotification();
                    $scope.$broadcast('scroll.refreshComplete');
                    if(errorMsg.code == 100){
                        $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                    }
                }
            });
        }

        $scope.addMembersForExpenses = function(user, index) {
            loadingScreen.showNotification();
            var query = new Parse.Query('trips');
            query.equalTo('objectId', $scope.tripId);
            query.first({
                success: function(result) {
                    var val = _.contains(result.attributes.members, user.id);
                    if (!val) {
                        var mainQuery = new Parse.Query('notification');
                        mainQuery.equalTo('tripId', $scope.tripId);
                        mainQuery.equalTo('userTripId', user.id);
                        mainQuery.find({
                            success: function(results) {
                                if (results.length != 0) {
                                    loadingScreen.hideNotification();
                                    $cordovaToast.show('User Yet to Confirm', 'short', 'bottom');
                                } else {
                                    var expObj = Parse.Object.extend('notification');
                                    var newObj = new expObj();
                                    newObj.set('name', result.attributes.name);
                                    newObj.set('date', result.attributes.date);
                                    newObj.set('parent', result.attributes.parent);
                                    newObj.set('tripId', result.id);
                                    newObj.set('confirmed', false);
                                    newObj.set('userTripId', user.id);
                                    newObj.save(null, {
                                        success: function(result) {
                                            $scope.resultUserForExpense[index].isAdded = false;
                                            $scope.$apply();
                                            loadingScreen.hideNotification();
                                            $cordovaToast.show('User added', 'short', 'bottom');
                                        },
                                        error: function(errorMsg) {
                                            loadingScreen.hideNotification();
                                            $scope.$broadcast('scroll.refreshComplete');
                                            if(errorMsg.code == 100){
                                                $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                                            }
                                        }
                                    })
                                }
                            }
                        })

                    } else {
                        loadingScreen.hideNotification();
                        $cordovaToast.show('Already member of the trip', 'short', 'bottom');

                    }
                },
                error: function(errorMsg) {
                    loadingScreen.hideNotification();
                    $scope.$broadcast('scroll.refreshComplete');
                    if(errorMsg.code == 100){
                        $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                    }
                }
            })
        }

        $scope.closePopover = function() {
            $scope.modal.hide();
        };

        $ionicModal.fromTemplateUrl('templates/expenses-new-templates.html', {
            scope: $scope
        }).then(function(modal) {
            //$scope.expenses = {};
            $scope.modal = modal;
        });

        $scope.calculateTotal = function($event) {

            var arr = [];
            var arr = _.pluck($scope.expensesItem, 'amount');
            var sum = _.reduce(arr, function(memo, num) {
                return memo + num;
            }, 0);
            var str = 'Total Till now :' + sum + $scope.currencyForTrip;
            $cordovaToast.show(str, 'short', 'bottom');
        }

        $scope.addExpenses = function(exp) {
            loadingScreen.showNotification();
            var expObj = Parse.Object.extend('expenses');
            var obj = new expObj();
            obj.set('name', exp.name);
            obj.set('amount', parseInt(exp.amount));
            obj.set('tripId', mySharedService.idVal);
            obj.set('parent', Parse.User.current().id);

            obj.save(null, {
                success: function(results) {
                    var createdBy = '';
                    for (var j = 0; j < $rootScope.userDetails.length; j++) {
                        if (results.attributes.parent === $rootScope.userDetails[j].id) {
                            createdBy = $rootScope.userDetails[j].name;
                        }
                    }
                    $scope.expensesItem.push({
                        'id': results.id,
                        'name': results.attributes.name,
                        'amount': results.attributes.amount,
                        'date': results.updatedAt,
                        'parentId': results.attributes.parent,
                        'createdBy': createdBy
                    });
                    $scope.closePopover();
                    loadingScreen.hideNotification();
                    $cordovaToast.show('Expense Added', 'short', 'bottom');
                    $scope.$apply();

                },
                error: function(errorMsg) {
                    loadingScreen.hideNotification();
                    $scope.$broadcast('scroll.refreshComplete');
                    if(errorMsg.code == 100){
                        $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                    }
                }
            });
        }

    });