( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager' )
        .controller( 'listEmployeeController', listEmployeeController );

    listEmployeeController.$invoke = [ '$scope', 'employees', 'EmployeeManagerFactory', '$timeout', '$filter' ];
    function listEmployeeController( $scope, employees, EmployeeManagerFactory, $timeout, $filter ) {
        $scope.tableConfig = {
            itemsPerPage: "8",
            maxPages: "3",
            fillLastPage: false,
            currentPage: $scope.tmpData( 'get', 'employeeManagerListPage' ) || 0
        };
        $scope.search = {};
        $scope.employees = employees;

        $scope.toggleAdvancedSearch = function () {
            $scope.showAdvancedSearch = !$scope.showAdvancedSearch;
            if ( !$scope.showAdvancedSearch ) {
                $scope.employees = employees;
            } else {
                $scope.avancedSearch();
            }
        };

        $scope.avancedSearch = function () {
            EmployeeManagerFactory.searchEmployee( $scope.search )
                .then( function ( foundEmployees ) {
                    $scope.employees = foundEmployees;
                });
        };

        $timeout( function () { // ???
            $( '[ng-click="stepPage(-numberOfPages)"]' ).text( $filter( 'i18next' )( 'actions.nextPage' ) );
            $( '[ng-click="stepPage(numberOfPages)"]' ).text( $filter( 'i18next' )( 'actions.lastPage' ) );
        });

        $scope.$on('$destroy', function () {
            $scope.tmpData('add', 'employeeManagerListPage', $scope.tableConfig.currentPage);
        });

    }
}());