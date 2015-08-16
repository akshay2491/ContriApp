angular.module('starter')

.controller('loginCtrl', function($scope, $state, $rootScope, $ionicLoading, loadingScreen, $ionicPopover, $ionicHistory, $localstorage, $cordovaToast, $ionicPopup,alertPopup) {
        $scope.user = {};
        $scope.isError = false;
        $scope.errReg = false;
        $scope.errorUser = false;

        $scope.show = function() {
            $ionicLoading.show({
                template: 'Loading...'
            });
        };
        $scope.hide = function() {
            $ionicLoading.hide();
        };

        $scope.hideError = function() {
            $scope.isError = false;
        }

        if (typeof analytics !== 'undefined') {
            analytics.trackView('Login');
        }

        $scope.$watch('user.username', function(oldName, newVal) {
            $scope.errorMsg = '';
            if ($scope.user.username) {
                if (oldName.length > 5 || oldName.length < 10) {

                } else {
                    $scope.errorMsg = false;
                    $scope.errorMsg = '';
                    $scope.$apply();
                }
            }

        });

        $scope.$watch('user.email', function(oldName, newVal) {
            if ($scope.user.email) {
                $scope.errorEmailMsg = '';
            }
        })



        $scope.$on('$ionicView.beforeEnter', function() {
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
            $scope.registerClearUser();
        });

        $scope.forgotPassword = function() {
            $state.go('forgotPassword');
        }

        $scope.resetPassword = function(email) {
            loadingScreen.showNotification();
            var query = new Parse.Query(Parse.User);
            query.equalTo('email', email);
            query.find({
                success: function(results) {
                    if (results.length == 0) {
                        loadingScreen.hideNotification();
                        alertPopup.showPopup('Email Id not registered!!!');
                    } else {

                        Parse.User.requestPasswordReset(email, {
                            success: function() {
                                loadingScreen.hideNotification();
                                alertPopup.showPopup('Reset password Link mailed to you!!!');
                            },
                            error: function(error) {
                                loadingScreen.hideNotification();
                                // Show the error message somewhere
                                if (error.code == 100) {
                                    $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                                }
                            }
                        });
                    }
                },
                error: function(errorMsg) {
                    loadingScreen.hideNotification();
                    if (errorMsg.code == 100) {
                        $cordovaToast.show('Connection failed.Check your network', 'short', 'bottom');
                    }
                }
            })
        }

        $scope.gotoMainPage = function(userList, formFactor) {
            if (formFactor.$valid) {

                loadingScreen.showNotification();
                Parse.User.logIn(userList.uName, userList.pName, {
                    success: function(user) {
                        $localstorage.setObject('User', user);
                        $scope.isError = false;
                        $rootScope.getAllUsers();
                        $rootScope.currentUser = user;
                        loadingScreen.hideNotification();
                        $state.go('tab.dash');
                        $scope.user = {};
                        $scope.$apply();
                    },
                    error: function(user, error) {
                        //console.log(error);
                        loadingScreen.hideNotification();
                        $scope.isError = true;
                        if (error.code == 100) {
                            $scope.errorMsg = 'Connection failed.Check your network';
                        } else {
                            $scope.errorMsg = error.message;
                        }

                    }
                });
            } else {
                $scope.err = true;
            }
        }

        $scope.registerClearUser = function() {
            $scope.user = {
                uname: '',
                email: '',
                password: '',
                username: '',
                confirmPass: ''
            };
        }


        $scope.registerUser = function(form) {

            if ($scope.user.password == $scope.user.confirmPass) {
                loadingScreen.showNotification();
                var user = new Parse.User();
                user.set("username", form.username);
                user.set("name", form.uname);
                user.set("password", form.password);
                user.set("email", form.email);
                user.set('image', 'http://placehold.it/100x100');

                // other fields can be set just like with Parse.Object
                user.signUp(null, {
                    success: function(user) {
                        alertPopup.showPopup('You Have Successfully Registered!!!');
                        $scope.user = {
                            uname: '',
                            email: '',
                            password: '',
                            username: '',
                            confirmPass: ''
                        };
                        loadingScreen.hideNotification();
                        $state.go('login');
                        // Hooray! Let them use the app now.
                    },
                    error: function(user, error) {
                        loadingScreen.hideNotification();
                        // Show the error message somewhere and let the user try again.
                        $scope.errReg = true;
                        if (error.code == 100) {
                            $scope.errorReg = 'Connection failed.Check your network';
                        }
                    }
                });
            } else {
                alertPopup.showPopup('Password Not Matching!!!');
            }
        }
    })
    .controller('loadingCtrl', function($rootScope, $scope, $ionicPlatform, $ionicPopup, $localstorage, $timeout, $location, $window, loadingScreen) {

        $scope.$on('$ionicView.enter', function() {
            loadingScreen.showNotification();
            $ionicPlatform.ready(function() {
                if (window.Connection) {
                    loadingScreen.hideNotification();
                    if (navigator.connection.type == Connection.NONE) {
                        $ionicPopup.confirm({
                                title: "No Internet Connection",
                                content: "The internet is disconnected on your device.",
                                buttons: [{
                                    text: 'Retry',
                                    type: 'button-positive',
                                    onTap: function(e) {
                                        return 0;
                                    }
                                }, {
                                    text: 'Exit',
                                    type: 'button-alert',
                                    onTap: function(e) {
                                        return 1;
                                    }
                                }]
                            })
                            .then(function(result) {
                                if (result == 1) {
                                    ionic.Platform.exitApp();
                                }
                                if (result == 0) {
                                    $window.location.reload(true);
                                }
                            });
                    } else {
                        if ($localstorage.getObject('User') != undefined) {
                            $timeout(function() {
                                $rootScope.getAllUsers();
                                $location.path('/tab/dash');
                                $rootScope.$apply();
                            }, 2500);
                        } else {
                            $timeout(function() {
                                $location.path('/login');
                                $rootScope.$apply();
                            }, 2500);
                        }
                    }
                }
            });
        });

    });