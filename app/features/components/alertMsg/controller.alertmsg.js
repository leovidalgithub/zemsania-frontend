( function () {
    'use strict';
    angular
        .module( 'hours.components' )
        .directive( 'alertMessage', alertMessage )
        .controller( 'alertMessageController', alertMessageController );

    alertMessageController.$invoke = [ '$scope', '$timeout' ];
    function alertMessageController( $scope, $timeout ) {

                    $scope.alertMessage = 'Ocurrió un error cargando los datos. Inténtelo de nuevo más tarde.';
            $scope.$watch( 'showme', function( value ) {
                if ( value !== null ) {
                    $timeout( function() { $scope.showme = null });
                    $scope.alertMessage = $scope.msg;

                    moveThis( 70, .95 );
                    $timeout( function() {
                        moveThis( -200, .05 );
                    }, $scope.iserror ? 4000 : 2000 ); // 6000 : 2500
                }
            });
            function moveThis( YP, OP ) {
                $( "#alertMessage .thisAlertBox" ).animate({
                    opacity: OP,
                    bottom : YP + 'px'
                }, 700, function() {
                });
            }

        }

    function alertMessage() {
        return {
            restrict: 'E',
            scope: {
                msg     : '=',
                showme  : '=',
                iserror : '='
            },
            transclude: false,
            templateUrl: 'features/components/alertMsg/alertmsg.tpl.html',
            controller : alertMessageController,
            link : function( scope, elem, attrs ) {
                scope.msg     = '';
                scope.showme  = null;
                scope.iserror = null;
            }
        };
    }
}());

// $window.innerWidth >= 600
