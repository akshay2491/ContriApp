angular.module('starter.directives',[])

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
        element.attr('src',element.attr('ng-src'));
      });
      
      var timeout = -1;
      try {
        var timeout = parseInt(element.attr('data-src-maxtime'), 10);
        loadSuccess[element.attr('ng-src')] =false;
      } catch (ex) {
      }
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
});