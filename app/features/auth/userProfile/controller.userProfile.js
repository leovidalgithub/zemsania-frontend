(function () {
    'use strict';
    angular
        .module('hours.auth')
        .controller('UserProfileController', UserProfileController);

    UserProfileController.$invoke = ['$scope', 'UserFactory', '$filter', '$timeout'];
    function UserProfileController($scope, UserFactory, $filter, $timeout) {
        $scope.user = angular.copy(UserFactory.getUser());

        function loadFields() {
            $scope.formFields = {
                username: {
                    element: 'input',
                    type: 'text'
                },
                name: {
                    element: 'input',
                    type: 'text'
                },
                surname: {
                    element: 'input',
                    type: 'text'
                },
                birthdate: {
                    element: 'date',
                    type: 'date'
                },
                nif: {
                    element: 'input',
                    type: 'text'
                },
                sex: {
                    element: 'select',
                    options: [
                        {
                            label: $filter('i18next')('user.genre_male'),
                            slug: 'male'
                        },
                        {
                            label: $filter('i18next')('user.genre_female'),
                            slug: 'female'
                        }
                    ]
                },
                locale: {
                    element: 'select',
                    options: [
                        {
                            label: $filter('i18next')('locale.es'),
                            slug: 'es'
                        },
                        {
                            label: $filter('i18next')('locale.en'),
                            slug: 'en'
                        }
                    ]
                }
            };
        }

        loadFields();

        $timeout(function () {
            loadFields();
        }, 500);

        $scope.open = function () {
            $scope.status.opened = true;
        };

        $scope.status = {
            opened: false
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            orientation: "bottom left",
            startingDay: 1,
            showWeeks: false
        };

        //$scope.$watch('user', function(value){
        //    if(value.name === redName){
        //        $i18next.options.lng = 'prt';
        //        $i18next.options.resGetPath = '/assets/locale/prt.json';
        //    }
        //}, true);

        $scope.save = function () {
            $scope.profileStatus = 0;
            UserFactory.saveProfile($scope.user)
                .then(function () {
                    $scope.profileStatus = 1;
                }, function () {
                    $scope.profileStatus = 2;
                });
        };

    }
}());