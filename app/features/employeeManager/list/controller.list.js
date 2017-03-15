( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager' )
        .controller( 'listEmployeeController', listEmployeeController );
        // .directive('myRole', myRole);

    listEmployeeController.$invoke = [ '$scope', 'employees', 'EmployeeManagerFactory', '$timeout', '$filter', '$window' ];
    function listEmployeeController( $scope, employees, EmployeeManagerFactory, $timeout, $filter ,$window ) {

        $scope.tableConfig = {
            itemsPerPage: getItemsPerPage(),
            maxPages: "3",
            fillLastPage: false,
            currentPage: $scope.tmpData( 'get', 'employeeManagerListPage' ) || 0
        };

        function getItemsPerPage() {
            return Math.floor( window.innerHeight / 60 ).toString();
        };

        $scope.search = {};
        $scope.employees = employees;
        $scope.var = false;
        setUsersView();

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

        $scope.pageGetUp = function() {
            $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
        };

        $scope.$on( '$destroy', function () {
            $scope.tmpData( 'add', 'employeeManagerListPage', $scope.tableConfig.currentPage );
        });


        angular.element( $window ).bind( 'resize', function() {
            $scope.$digest();
            setUsersView();
        });
        function setUsersView() {
            if( $window.innerWidth < 930 ) {
                $scope.viewSet = false;
            } else {
                $scope.viewSet = true;            
            }
        }

        var wrapper = document.getElementById( 'section' );
        wrapper.onscroll = function ( event ) {
            // if ( wrapper.scrollTop + window.innerHeight >= wrapper.scrollHeight ) {
            if ( wrapper.scrollTop >= 400 ) {
                $( '#toUpButton' ).fadeIn( 'slow' );
            }
                if ( wrapper.scrollTop < 400 ) {
            $( '#toUpButton' ).fadeOut( 'slow' );
            }
        };

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
