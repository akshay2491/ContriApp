angular.module('starter')

.controller('tripCtrl', function($scope, $cordovaToast, $rootScope, $state, $ionicPopover, $ionicModal, loadingScreen) {

    $scope.showUser = false;
    $scope.trip = {};
    $scope.trip.currency = 'Rs';

    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.loadTheUserInMember();
        //$scope.presentDateFromSystem();
    });

    if(typeof analytics !== 'undefined') {
            analytics.trackView('Trip');
        }

   /* $scope.presentDateFromSystem = function() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        $scope.presentDate = today;
    };*/

    $scope.hideError = function() {
            $scope.isError = false;
        }

    

    $scope.currency = [{'name':'INR','value':'Rs'},{'name':'Pound(£)','value':'£'},{'name':'Euro(€)','value':'€'}
    ,{'name':'US Dollar($)','value':'$'}];


    $scope.loadTheUserInMember = function() {
        $scope.members = [];
        var resultUserObj = {
            name: '',
            email: '',
            id: '',
            image: ''
        };
        resultUserObj.name = $rootScope.currentUser.attributes.name + '(You)';
        resultUserObj.email = $rootScope.currentUser.attributes.email;
        resultUserObj.image = $rootScope.currentUser.attributes.image;
        resultUserObj.id = $scope.currentUser.id;
        $scope.members.push(resultUserObj);
    }

    $scope.getUserFromSearch = function(name) {
        loadingScreen.showNotification();
        $scope.hideErrorMsg = false;
        var resultUser = [];
        //$scope.resultUser = [];
        var query = new Parse.Query(Parse.User);
        query.find({
            success: function(results) {
                _.each(results, function(user) {
                    if (user.attributes.name.toUpperCase().indexOf(name.name.toUpperCase()) > -1 || user.attributes.name.toUpperCase() === name.name.toUpperCase() || user.attributes.username.toUpperCase() === name.name.toUpperCase()) {
                        var resultUserObj = {
                            name: '',
                            email: '',
                            id: ''
                        };
                        if ($scope.members.length != 0) {
                            var isPresent = false;
                            for (var i = 0; i < $scope.members.length; i++) {
                                if ($scope.members[i].id == user.id) {
                                    isPresent = true;
                                }
                            }
                            if (!isPresent) {
                                resultUserObj.name = user.attributes.name;
                                resultUserObj.email = user.attributes.email;
                                resultUserObj.image = user.attributes.image;
                                resultUserObj.id = user.id;
                                resultUserObj.isAdded = true;
                                resultUser.push(resultUserObj);
                            }

                        } else {
                            resultUserObj.name = user.attributes.name;
                            resultUserObj.email = user.attributes.email;
                            resultUserObj.image = user.attributes.image;
                            resultUserObj.isAdded = true;
                            resultUserObj.id = user.id;
                            resultUser.push(resultUserObj);
                        }
                    } else {
                        //$cordovaToast.show('No user found','short','bottom');
                    }
                });
                loadingScreen.hideNotification();
                $scope.showUser = true;
                if (resultUser.length == 0) {
                    $scope.hideErrorMsg = true;
                }
                $scope.resultUser = resultUser;
                $scope.$apply();
            },
            error: function(errorMsg) {
                loadingScreen.hideNotification();
                $scope.$broadcast('scroll.refreshComplete');
                $cordovaToast.show('Failed To Load', 'short', 'bottom');
            }
        })
    }

    $scope.addMembers = function(user) {
        if ($scope.members.length != 0) {
            var resultUserObj = {
                name: '',
                email: '',
                id: '',
                image: ''
            };
            resultUserObj.name = user.name;
            resultUserObj.email = user.email;
            resultUserObj.image = user.image;
            resultUserObj.id = user.id;
            for (var i = 0; i < $scope.resultUser.length; i++) {
                if ($scope.resultUser[i].id == user.id) {
                    $scope.resultUser[i].isAdded = false;
                    $scope.resultUser[i] = {};
                    $scope.members.push(resultUserObj);
                    $scope.searchName.name = '';
                    var msg = user.name + ' Added';
                    $cordovaToast.show(msg, 'short', 'bottom');
                }
            }
        } else {
            for (var i = 0; i < $scope.resultUser.length; i++) {
                if ($scope.resultUser[i].id == user.id) {
                    var resultUserObj = {
                        name: '',
                        email: '',
                        id: '',
                        image: ''
                    };
                    resultUserObj.name = user.name;
                    resultUserObj.email = user.email;
                    resultUserObj.image = user.image;
                    resultUserObj.id = user.id;
                    $scope.resultUser[i].isAdded = false;
                    $scope.resultUser[i] = {};
                    $scope.members.push(resultUserObj);
                    $scope.searchName.name = '';
                    var msg = user.name + ' Added';
                    $cordovaToast.show(msg, 'short', 'bottom');
                }
            }
        }
    }

    $scope.removeMembers = function(index) {
        $scope.members.splice(index, 1);
    }

    $ionicModal.fromTemplateUrl('templates/my-modal.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });


    $scope.openContacts = function() {
        $scope.hideErrorMsg = false;
        $scope.resultUser = [];
        $scope.searchName = {};
        $scope.modal.show();
    };

    $scope.closePopover = function() {
        $scope.modal.hide();
    };

    $scope.submitTrip = function(tripDetails) {
        var mydate = new Date(tripDetails.date);
        loadingScreen.showNotification();
        var userTemp = _.pluck($scope.members, 'id');
        var userArray = [];
        var tripObj = Parse.Object.extend('trips');
        var obj = new tripObj();
        userArray.push($rootScope.currentUser.id);
        obj.set('name', tripDetails.name);
        obj.set('date', mydate);
        obj.set('parent', $rootScope.currentUser.id);
        obj.set('currency',tripDetails.currency.value);
        obj.set('members', userArray);
        obj.save(null, {
            success: function(results) {
                console.log(results)
                _.each(userTemp, function(list) {
                    if (list != $rootScope.currentUser.id) {
                        var notificationObj = Parse.Object.extend('notification');
                        var newObj = new notificationObj();
                        newObj.set('name', results.attributes.name);
                        newObj.set('date', results.attributes.date);
                        newObj.set('parent', results.attributes.parent);
                        newObj.set('tripId', results.id);
                        newObj.set('confirmed', false);
                        newObj.set('userTripId', list);
                        newObj.save(null, {
                            success: function(result) {},
                            error: function(err) {

                            }
                        })
                    }
                })
                loadingScreen.hideNotification();
                $cordovaToast.show('Event Added.Waiting for Members to Join', 'short', 'bottom');
                $scope.tripDetails = {};
                $scope.members = [];
                $state.go('tab.dash');
            },
            error: function(errorMsg) {
                loadingScreen.hideNotification();
                $scope.$broadcast('scroll.refreshComplete');
                $cordovaToast.show('Failed To Load', 'short', 'bottom');
            }
        });
    }
});