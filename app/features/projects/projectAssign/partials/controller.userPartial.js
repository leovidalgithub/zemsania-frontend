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
            ProjectsFactory.getProjectsByUserId( userId )
                .then( function ( projects ) {
                    $rootScope.$broadcast( 'sendFilteredProjects', { projects : projects } );
                })
                .catch( function ( err ) {
                })
                .finally( function() {
                });
        };

// 15MS0643IECEC6
// 15MS0160EMTSAU
        $rootScope.$on( 'sendFilteredUsers', function( event, filteredUsers ) {
            $scope.employees = filteredUsers.users.users;
        });

    }

}());
