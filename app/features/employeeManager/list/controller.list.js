( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager' )
        .controller( 'listEmployeeController', listEmployeeController );
        // .directive('myRole', myRole);

    listEmployeeController.$invoke = [ '$scope', 'employees', 'EmployeeManagerFactory', '$timeout', '$filter' ];
    function listEmployeeController( $scope, employees, EmployeeManagerFactory, $timeout, $filter ) {
        $scope.tableConfig = {
            itemsPerPage: getViwePortHeight(),
            maxPages: "3",
            fillLastPage: false,
            currentPage: $scope.tmpData( 'get', 'employeeManagerListPage' ) || 0
        };

        function getViwePortHeight() {
            return Math.floor( window.innerHeight / 80 ).toString();
        };

        $scope.search = {};
        $scope.employees = employees;

        $scope.var = false;

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
            $( '[ng-click="stepPage(numberOfPages)"]'  ).text( $filter( 'i18next' )( 'actions.lastPage' ) );
        });

        $scope.$on( '$destroy', function () {
            $scope.tmpData( 'add', 'employeeManagerListPage', $scope.tableConfig.currentPage );
        });

}

    // function myRole(UserFactory) {
    //     return {
    //         restrict: 'A',
    //         scope: {
    //             'myRole': '@'
    //         },
    //         compile: function(element, attributes){  
    //             return {
    //                 pre: function(scope, element, attributes, controller, transcludeFn){
    //                     element.remove();
    //                 },
    //                 post: function(scope, element, attributes, controller, transcludeFn){
    //                 }
    //             }
    //         },
    //         link: function compile(scope, element, attrs) {
    //         }
    //     };
    // }

}());
