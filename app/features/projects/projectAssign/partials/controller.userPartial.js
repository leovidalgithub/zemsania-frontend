;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ProjectAssignUsersController', ProjectAssignUsersController );

    ProjectAssignUsersController.$invoke = [ '$scope', '$rootScope', 'EmployeeManagerFactory', 'ProjectsFactory', '$uibModal' ];
    function ProjectAssignUsersController( $scope, $rootScope, EmployeeManagerFactory, ProjectsFactory, $uibModal )  {

        $scope.openUserInfo = function ( user , event ) {
            event.preventDefault();
            event.stopPropagation();
            var modalInstance = $uibModal.open( {
                animation: true,
                templateUrl: '/features/projects/projectAssign/modals/modalUserInfo.tpl.html',
                controller : 'ModalInfo',
                resolve : {
                    data : user 
                }
            }).result.then( function() {}, function( res ) {} ); // to avoid: 'Possibly unhandled rejection: backdrop click'
        };

        $scope.$on( 'toSearchEvent', function( event, data ) {
            $scope.spinners.users = true;
            EmployeeManagerFactory.advancedUserSearch( { textToFind : data.searchText } )
                .then( function ( data ) {
                    ProjectsFactory.toAddActiveField( data );
                    $scope.employees = data;
                })
                .catch( function ( err ) {
                })
                .finally( function() {
                    $scope.spinners.users = false;
                });
        });

        $scope.activeThisUser = function( user ) {
            $scope.$parent.$parent.currentMode.obj = user;
            $scope.$parent.$parent.currentMode.type = 'users';
            // set active to true for selected item
            ProjectsFactory.setActiveItem( $scope.employees, user._id );
            // get all projects that belong to selected user
            ProjectsFactory.getProjectsByUserId( user._id )
                .then( function ( projects ) {
                    // create and set all projects items with 'active = false' field 
                    ProjectsFactory.toAddActiveField( projects );
                    $rootScope.$broadcast( 'sendFilteredProjects', { projects : projects } );
                })
                .catch( function ( err ) {
                })
                .finally( function() {
                });
        };

        $rootScope.$on( 'sendFilteredUsers', function( event, filteredUsers ) {
            $scope.employees = filteredUsers.users.users;
        });

    }

}());


