;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ProjectAssignUsersController', ProjectAssignUsersController );

    ProjectAssignUsersController.$invoke = [ '$scope', 'EmployeeManagerFactory', 'ProjectsFactory' ];
    function ProjectAssignUsersController( $scope, EmployeeManagerFactory, ProjectsFactory ) {

        $scope.$on( 'toSearchEvent', function( event, data ) {
            $scope.spinners.users = true;

            EmployeeManagerFactory.advancedUserSearch( { textToFind : data.searchText } )
                .then( function ( data ) {
                    $scope.employees = data;
                })
                .catch( function ( err ) {
                })
                .finally( function() {
                    $scope.spinners.users = false;
                });
        });

        $scope.activeThisUser = function( userId ) {
            ProjectsFactory.getProjectsById( userId )
                .then( function ( data ) {
                })
                .catch( function ( err ) {
                })
                .finally( function() {
                });
        };


    }

}());