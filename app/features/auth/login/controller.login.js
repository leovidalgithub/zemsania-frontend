(function () {
'use strict';
    angular
        .module('hours.auth')
        .controller('LoginController', LoginController);

    LoginController.$invoke = ['$scope', 'UserFactory', '$state'];
    function LoginController($scope, UserFactory, $state) {
        initialVertex();
        $scope.loginForm = {
            username: null,
            password: null
        };

        $scope.login = function () {
            $scope.loginForm.error = false;
            $scope.loginForm.disabled = true;
            UserFactory.doLogin($scope.loginForm)
                .then(function (user) {
                    if (user.defaultPassword) {
                        $state.go('changePassword');
                    } else {
                        $state.go('dashboard');
                    }
                }, function (err) {
                    $scope.loginForm.disabled = false;
                    $scope.loginForm.error = err;
                });
        };

        $scope.$on('$destroy', function () {
            window.continueVertexPlay = false;
        });
    }
}());