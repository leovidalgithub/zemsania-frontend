;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ProjectAssignUsersController', ProjectAssignUsersController );

    ProjectAssignUsersController.$invoke = [ '$scope', '$rootScope', 'EmployeeManagerFactory', 'ProjectsFactory' ];
    function ProjectAssignUsersController( $scope, $rootScope, EmployeeManagerFactory, ProjectsFactory ) {

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
                .then( function ( projects ) {
                    // console.log('$scope.employees');
                    // console.log($scope.employees);
                    // console.log('$scope.projects');
                    // console.log($scope.projects);
                    $rootScope.$broadcast( 'toFilterProjects', { projects : projects } );
                })
                .catch( function ( err ) {
                })
                .finally( function() {
                });
        };


    }

}());