( function () {
    'use strict';
    angular
        .module( 'hours.components' )
        .directive( 'alertMessage', alertMessage )
        .controller( 'alertMessageController', alertMessageController );

    alertMessageController.$invoke = [ '$scope', '$timeout' ];
    function alertMessageController( $scope, $timeout ) {

            $scope.$watch( 'iserror', function( value ) {
                if ( value != null ) {
                    $scope.alertMessage = $scope.msg;
                    moveThis( 60, .95 );
                    $timeout( function() {
                        moveThis( -200, 0 );
                    }, $scope.iserror ? 6000 : 2500 );
                }
            });
            function moveThis( YP, OP ) {
                $( "#alertMessage .thisAlertBox" ).animate({
                    opacity: OP,
                    bottom : YP + 'px'
                }, 650, function() {
                    if( YP < 0) $timeout( function() { $scope.iserror = null } );
                });
            }
        }

    function alertMessage() {
        return {
            restrict: 'E',
            scope: {
                msg     : '=',
                iserror : '='
            },
            transclude: false,
            templateUrl: 'features/components/alertMsg/alertmsg.tpl.html',
            controller : alertMessageController,
            link : function( scope, elem, attrs ) {
                scope.msg     = '';
                scope.iserror = null;
            }
        };
    }
}());

// $window.innerWidth >= 600
