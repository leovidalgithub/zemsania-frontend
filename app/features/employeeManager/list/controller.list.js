( function () {
    'use strict';
    angular
        .module( 'hours.employeeManager' )
        .controller( 'listEmployeeController', listEmployeeController );

    listEmployeeController.$invoke = [ '$scope', 'employees', 'EmployeeManagerFactory', '$timeout', '$filter', '$window' ];
    function listEmployeeController( $scope, employees, EmployeeManagerFactory, $timeout, $filter ,$window ) {

        $scope.tableConfig = {
            itemsPerPage: getItemsPerPage( 65 ),
            maxPages: "3",
            fillLastPage: false,
            currentPage: $scope.tmpData( 'get', 'employeeManagerListPage' ) || 0
        };

        $scope.search = {};
        $scope.employees = employees;
        $scope.var = false;
        setUsersView();

        // ADVANDED SEARCH TOGGLE BUTTON
        $scope.toggleAdvancedSearch = function () {
            takeMeUp();
            $scope.showAdvancedSearch = !$scope.showAdvancedSearch;
            if ( !$scope.showAdvancedSearch ) {
                $scope.employees = employees;
            } else {
                $scope.avancedSearch();
                $timeout( function() { // search input set_focus
                    document.getElementById( 'searchInput' ).focus();
                });
            }
        };

        // ADVANDED SEARCH SERVICE FUNCTION
        $scope.avancedSearch = function () {
            EmployeeManagerFactory.advancedUserSearch( $scope.search )
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

        // SECTION SCROLL MOVE EVENT TO MAKE BUTTON 'toUpButton' APPEAR
        var scrollWrapper = document.getElementById( 'section' );
        scrollWrapper.onscroll = function ( event ) {
            var currentScroll = scrollWrapper.scrollTop;
            var upButton = $( '#toUpButton' );
            showUpButton( upButton, currentScroll );
        };

        // BUTTON TO TAKE SECTION SCROLL TO TOP
        $scope.pageGetUp = function() { takeMeUp() };

}


}());


    // .directive('myRole', myRole);
    // IT WAS FOR TRYING TO REMOVE A COMPLETE ELEMENT (TD) FROM AT-TABLE BUT DID NOT WORK PROPERLY
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
