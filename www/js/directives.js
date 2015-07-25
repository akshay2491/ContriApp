angular.module('starter.directives',[])

.directive('myclick', function() {

    return function(scope, element, attrs) {

        element.bind('touchstart click', function(event) {
        	console.log('dir');
            event.preventDefault();
            event.stopPropagation();

            scope.$apply(attrs['myclick']);
        });
    };
});