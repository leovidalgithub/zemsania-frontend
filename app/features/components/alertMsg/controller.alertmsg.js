( function () {
    'use strict';
    angular
        .module( 'hours.components' )
        .directive( 'alertMessage', alertMessage )
        .controller( 'alertMessageController', alertMessageController );

    alertMessageController.$invoke = [ '$scope', '$interval', '$window' ];
    function alertMessageController( $scope, $interval, $window ) {
            var $alertSome = $( '#alertMessage .msgAlert' );
            var promiseInterval;
            $scope.$watch( 'error', function( value ) {
                if ( value !== null ) {
                    $interval.cancel( promiseInterval );
                    $scope.horizontalMode = true;
                    // $scope.horizontalMode = ( $window.innerWidth >= 600 ) ? true : false;
                    $scope.alertMessage = $scope.msg;
                    $alertSome.collapse( 'show' );
                    promiseInterval = $interval( function() {
                        $scope.error = null;
                        $alertSome.collapse( 'hide' );
                    }, $scope.error ? 6000 : 2500 );
                }
            });
        }

    function alertMessage() {
        return {
            restrict: 'E',
            scope: {
                error : '=',
                msg   : '='
            },
            transclude: false,
            templateUrl: 'features/components/alertMsg/alertmsg.tpl.html',
            controller : alertMessageController,
            link : function( scope, elem, attrs ) {
                scope.error = null;
                scope.msg = '';
            }
        };
    }

}());
