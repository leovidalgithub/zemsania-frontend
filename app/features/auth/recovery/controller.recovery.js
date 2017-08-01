( function () {
    'use strict';
    angular
        .module( 'hours.auth' )
        .controller( 'RecoveryController', RecoveryController );

    RecoveryController.$invoke = [ '$scope', 'UserFactory', '$state', '$timeout' ];
    function RecoveryController( $scope, UserFactory, $state, $timeout ) {

        initialVertex();

        $scope.recoveryForm = {
                            email: null
                        };

        $scope.recovery = function () {
            $scope.recoveryForm.error   = false;
            $scope.recoveryForm.success = false;
  
            UserFactory.doPasswordRecovery( $scope.recoveryForm )
                .then( function( data ) {
                    $scope.recoveryForm.success = true;
                                        
                    $timeout( function ( data ) {
                        $state.go( 'login' );
                    }, 5000 );

                })
                .catch( function ( err ) {
                    $scope.recoveryForm.error = err;
                });
        };
    }
}());