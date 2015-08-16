angular.module('starter.directives', [])

.directive('myclick', function() {

        return function(scope, element, attrs) {

            element.bind('touchstart click', function(event) {
                event.preventDefault();
                event.stopPropagation();

                scope.$apply(attrs['myclick']);
            });
        };
    })
    .directive('threshold', function($timeout) {
        var loadSuccess = {};
        return {
            link: function(scope, element, attrs) {
                element.bind('error', function() {
                    scope.$apply(function() {
                        element.attr('src', element.attr('data-src-fallback'));
                    });
                });
                element.bind('load', function() {
                    loadSuccess[element.attr('ng-src')] = true;
                    element.attr('src', element.attr('ng-src'));
                });

                var timeout = -1;
                try {
                    var timeout = parseInt(element.attr('data-src-maxtime'), 10);
                    loadSuccess[element.attr('ng-src')] = false;
                } catch (ex) {}
                if (timeout != -1) {
                    if (!loadSuccess[element.attr('ng-src')]) {
                        $timeout(function() {
                            if (!loadSuccess[element.attr('ng-src')]) {
                                element.attr('src', element.attr('data-src-fallback'));
                            }
                        }, timeout);
                    }
                }
            }
        };
    })
    .directive('blacklist', function(loadingScreen) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attr, ngModel) {
                elem.bind('blur', function(e) {
                    if (attr.option === '0') {
                        var value = attr.blacklist;
                        if (value.length > 4 && value.length < 13) {
                            loadingScreen.showNotification();
                            var query = new Parse.Query(Parse.User);
                            query.equalTo('username', value);
                            query.find({
                                success: function(results) {
                                    if (results.length == 0) {
                                        loadingScreen.hideNotification();
                                        ngModel.$setValidity('blacklist', true);
                                        return value;
                                    } else {
                                        loadingScreen.hideNotification();
                                        ngModel.$setValidity('blacklist', false);
                                        return value;
                                    }
                                },
                                error: function(errorMsg) {
                                    loadingScreen.hideNotification();
                                    if (errorMsg.code == 100) {
                                        $cordovaToast.show('Cant verify Username.Check your network', 'short', 'bottom');
                                    }
                                }
                            })
                        }
                    } else {
                        var value = attr.blacklist;
                        if (value) {
                            loadingScreen.showNotification();
                            var query = new Parse.Query(Parse.User);
                            query.equalTo('email', value);
                            query.find({
                                success: function(results) {
                                    if (results.length == 0) {
                                        loadingScreen.hideNotification();
                                        ngModel.$setValidity('blacklist', true);
                                        return value;
                                    } else {
                                        loadingScreen.hideNotification();
                                        ngModel.$setValidity('blacklist', false);
                                        return value;
                                    }
                                },
                                error: function(errorMsg) {
                                    loadingScreen.hideNotification();
                                    if (errorMsg.code == 100) {
                                        $cordovaToast.show('Cant verify Email Id.Check your network', 'short', 'bottom');
                                    }
                                }
                            })
                        }
                    }
                });
            }
        };
    });