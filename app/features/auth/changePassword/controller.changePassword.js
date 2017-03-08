( function () {
    'use strict';
    angular
        .module( 'hours.auth' )
        .controller( 'ChangePasswordController', ChangePasswordController );

    ChangePasswordController.$invoke = [ '$scope', 'UserFactory', '$state', '$timeout' ];
    function ChangePasswordController( $scope, UserFactory, $state, $timeout ) {
        initialVertex();
        $scope.passwordForm = {
                current : null,
                new     : null,
                confirm : null
        };

        $scope.changePassword = function () {
            $scope.passwordForm.success = false;
            $scope.passwordForm.error = false;

            UserFactory.doChangePassword( $scope.passwordForm )
                .then( function ( data ) {
                    if ( data.data.success ) {
                        $scope.passwordForm.success = true;
                        $scope.changePassword.messageToDisplay = 'success';
                        $timeout( function () {
                            $state.go( 'login' );
                        }, 2500 );
                    } else {
                        $scope.passwordForm.error = true;
                        console.log(data.data.code);
                        switch( data.data.code ) {
                            case 101:
                                $scope.changePassword.messageToDisplay = 'userNotFound';
                                break;
                            case 102:
                                $scope.changePassword.messageToDisplay = 'currentPassIncorrect';
                        }
                    }
                })
                .catch( function ( err ) {
                        $scope.passwordForm.error = true;
                        $scope.changePassword.messageToDisplay = 'error';
                });
        };

        $scope.$on( '$destroy', function () {
            window.continueVertexPlay = false;
        });
    }
}());