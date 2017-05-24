;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ProjectAssignUsersController', ProjectAssignUsersController );

    ProjectAssignUsersController.$invoke = [ '$scope', '$rootScope', 'EmployeeManagerFactory', 'ProjectsFactory', '$uibModal', '$filter' ];
    function ProjectAssignUsersController( $scope, $rootScope, EmployeeManagerFactory, ProjectsFactory, $uibModal, $filter )  {

        $scope.openUserInfo = function ( user , event ) {
            event.preventDefault();
            event.stopPropagation(); // to avoid continue to select item
            var modalInstance = $uibModal.open( {
                animation: true,
                templateUrl: '/features/projects/projectAssign/modals/modalUserInfo.tpl.html',
                controller : 'ModalInfo',
                resolve : {
                    data : user
                },
                backdrop: 'static',
                size: 'md',
            }).result.then( function() {}, function( res ) {} ); // to avoid this error: 'Possibly unhandled rejection: backdrop click'
        };

        // receiving event from controller.projectAssign when search is done
        $scope.$on( 'toSearchEvent', function( event, data ) {
            $scope.spinners.users = true;
            EmployeeManagerFactory.advancedUserSearch( { textToFind : data.searchText } )
                .then( function ( data ) {
                    ProjectsFactory.toAddActiveField( data ); // create and set all users items with 'active = false' field
                    $scope.employees = data;
                    ProjectsFactory.setItemsOcurrences( $scope.employees ); // get and set number of ocurrences on ProjectUser entity
                })
                .catch( function ( err ) {
                    $rootScope.$broadcast( 'messageAlert', {
                                        error : true,
                                        message : $filter( 'i18next' )( 'projects.projectAssign.errorData' ) } );
                })
                .finally( function() {
                    $scope.spinners.users = false;
                });
        });

        $scope.activeThisUser = function( user ) {
            $scope.spinners.projects = true;
            $scope.$parent.$parent.currentMode.obj  = user;
            $scope.$parent.$parent.currentMode.type = 'users';
            // set active to true for selected item
            ProjectsFactory.setActiveItem( $scope.employees, user._id );
            // get all projects that belong to selected user
            ProjectsFactory.getProjectsByUserId( user._id )
                .then( function ( projects ) {
                    ProjectsFactory.toAddActiveField( projects ); // create and set all users items with 'active = false' field
                    $rootScope.$broadcast( 'sendFilteredProjects', { projects : projects } );
                })
                .catch( function ( err ) {
                    $rootScope.$broadcast( 'messageAlert', {
                                        error : true,
                                        message : $filter( 'i18next' )( 'projects.projectAssign.errorData' ) } );
                })
                .finally( function() {
                    $scope.spinners.projects = false;
                });
        };

        // receiving event from controller.project when a project is clicked
        $rootScope.$on( 'sendFilteredUsers', function( event, filteredUsers ) {
            $scope.employees = filteredUsers.users.users;
            ProjectsFactory.setItemsOcurrences( $scope.employees ); // get and set number of ocurrences on ProjectUser entity
        });

        // when a relationship is added or erased, we need to refresh the Project view list. It comes from controller.marcate
        $rootScope.$on( 'refreshactiveThisUser', function( event, data ) {
            $scope.activeThisUser( $scope.$parent.$parent.currentMode.obj ); // to refresh projects items list view
            ProjectsFactory.setItemsOcurrences( $scope.employees ); // get and set number of ocurrences on ProjectUser entity
        });

    }

}());
