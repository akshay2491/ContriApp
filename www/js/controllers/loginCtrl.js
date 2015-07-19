angular.module('starter')

.controller('loginCtrl', function($scope, $state, $rootScope, $ionicLoading, loadingScreen, $mdDialog, $ionicPopover, $ionicHistory, $localstorage) {
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

    $scope.changeUserName = function(name) {
        if (name != undefined) {
            if (name.length > 4 && name.length < 13) {
                loadingScreen.showNotification();
                console.log(name)
                var query = new Parse.Query(Parse.User);
                query.equalTo('username', name);
                query.find({
                    success: function(results) {
                        console.log(results);
                        if (results.length == 0) {
                            loadingScreen.hideNotification();
                            $scope.errorMsg = 'User Name Available';
                            $scope.$apply();
                        } else {
                            loadingScreen.hideNotification();
                            $scope.errorMsg = 'User Name Not Available';
                            $scope.$apply();
                        }
                    }
                })
            }
        }
    }

    $scope.$watch('user.confirmPass', function(oldName, newVal) {
        if ($scope.user.confirmPass) {
            if ($scope.user.password === $scope.user.confirmPass) {
                $scope.mismatchPassword = 'Perfect';
            } else {
                $scope.mismatchPassword = 'Password Not Matching';

            }
        }
    })

    $scope.changeUserEmail = function(email) {
        if ($scope.user.email) {
            loadingScreen.showNotification();
            var query = new Parse.Query(Parse.User);
            query.equalTo('email', email);
            query.find({
                success: function(results) {
                    if (results.length == 0) {
                        loadingScreen.hideNotification();
                        $scope.errorEmailMsg = '';
                        $scope.$apply();
                    } else {
                        loadingScreen.hideNotification();
                        $scope.errorEmailMsg = 'Email id is Registered.';
                        $scope.$apply();
                    }
                }
            })
        }
    }

    $scope.clearerror = function() {
        $scope.errorEmailMsg = '';
    }


    $scope.$on('$ionicView.beforeEnter', function() {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        $scope.registerClearUser();
    });

    $scope.forgotPassword = function() {
        $state.go('forgotPassword');
    }

    $scope.resetPassword = function(email) {
        var query = new Parse.Query(Parse.User);
        query.equalTo('email',email);
        query.find({success:function(results){
            if(results.length == 0) {
                $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .title('Alert Message')
                .content('Email Not Registered.Enter right Email')
                .ariaLabel('Alert Dialog Demo')
                .ok('Got it!')
                );
            }
            else
            {
                Parse.User.requestPasswordReset(email, {
                  success: function() {
                    $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert Message')
                    .content('Reset password Link mailed to you')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Got it!')
                    );
                  },
                  error: function(error) {
                    // Show the error message somewhere
                    alert("Error: " + error.code + " " + error.message);
                  }
                });
            }
        }})
    }

    $scope.gotoMainPage = function(userList) {
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
                loadingScreen.hideNotification();
                $scope.isError = true;
                $scope.errorMsg = error;
            }
        });
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
        var user = new Parse.User();
        user.set("username", form.username);
        user.set("name", form.uname);
        user.set("password", form.password);
        user.set("email", form.email);
        user.set('image', 'http://placehold.it/100x100');

        // other fields can be set just like with Parse.Object
        user.signUp(null, {
            success: function(user) {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .title('Alert Message')
                    .content('You Have successfully Registered.Please Verify your Email id sent to you.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Got it!')
                );
                $scope.user = {
                    uname: '',
                    email: '',
                    password: '',
                    username: '',
                    confirmPass: ''
                };
                $state.go('login');
                // Hooray! Let them use the app now.
            },
            error: function(user, error) {
                // Show the error message somewhere and let the user try again.
                $scope.errReg = true;
                $scope.errorReg = error.message;
            }
        });
    }
});