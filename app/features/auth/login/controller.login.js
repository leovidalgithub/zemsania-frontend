(function () {
'use strict';
    angular
        .module('hours.auth')
        .controller('LoginController', LoginController);

    LoginController.$invoke = [ '$scope', 'UserFactory', '$state' ];
    function LoginController( $scope, UserFactory, $state ) {
        initialVertex();
        $scope.loginForm = {
            username: null,
            password: null
        };

        // $scope.loginCategory = $localStorage.loginCategory || 'standard';
        // $scope.switchLoginCategory = function(cat) { $localStorage.loginCategory = $scope.loginCategory = cat; }
        // $scope.isCategoryActive = function(cat) {
        //     return $scope.loginCategory == cat;
        // }

        $scope.login = function () {
            $scope.loginForm.error = false;
            $scope.loginForm.disabled = true;
            UserFactory.doLogin( $scope.loginForm )
                .then( function ( data ) {
                    if ( data.defaultPassword ) {
                        $state.go( 'changePassword' );
                    } else {
                        $state.go( 'dashboard' );
                    }
                })
                .catch( function ( err ) {
                    $scope.loginForm.disabled = false;
                    $scope.loginForm.error = err;
                });
        };

        $scope.$on('$destroy', function () {
            window.continueVertexPlay = false;
        });
    }
}());