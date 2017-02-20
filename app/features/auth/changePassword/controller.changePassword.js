(function () {
    'use strict';
    angular
        .module('hours.auth')
        .controller('ChangePasswordController', ChangePasswordController);

    ChangePasswordController.$invoke = ['$scope', 'UserFactory', '$state', '$timeout'];
    function ChangePasswordController($scope, UserFactory, $state, $timeout) {
        initialVertex();
        $scope.passwordForm = {
            oldPassword: null,
            password: null,
            password2: null
        };

        $scope.changePassword = function () {
            $scope.passwordForm.error = false;

            UserFactory.doChangePassword($scope.passwordForm)
                .then(function () {
                    $scope.passwordForm.success = true;

                    $timeout(function () {
                        $state.go('login');
                    }, 1500);
                }, function (err) {
                    $scope.passwordForm.error = err;
                });
        };

        $scope.$on('$destroy', function () {
            window.continueVertexPlay = false;
        });
    }
}());