;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ProjectAssignProjectController', ProjectAssignProjectController );

    ProjectAssignProjectController.$invoke = [ '$scope', 'ProjectsFactory', '$uibModal', '$rootScope', '$filter', '$timeout' ];
    function ProjectAssignProjectController( $scope, ProjectsFactory, $uibModal, $rootScope, $filter, $timeout ) {

        $scope.openProjectInfo = function ( project, event ) {
            event.preventDefault();
            event.stopPropagation(); // to avoid continue to select item
            var modalInstance = $uibModal.open( {
                animation: true,
                templateUrl: '/features/projects/projectAssign/modals/modalProjectInfo.tpl.html',
                controller : 'ModalInfo',
                resolve : {
                    data : project
                },
                backdrop: 'static',
                size: 'md',
            }).result.then( function() {}, function( res ) {} ); // to avoid: 'Possibly unhandled rejection: backdrop click'
        };

        // receiving event from controller.projectAssign when search is done
        $scope.$on( 'toSearchEvent', function( event, data ) {
            $scope.spinners.projects = true;
            ProjectsFactory.advancedProjectSearch( data.searchText )
                .then( function ( data ) {
                    ProjectsFactory.toAddActiveField( data.projects ); // create and set all users items with 'active = false' field
                    $scope.projects = data.projects;
                    ProjectsFactory.setItemsOcurrences( $scope.projects ); // get and set number of ocurrences on ProjectUser entity
                })
                .catch( function ( err ) {
                    $rootScope.$broadcast( 'messageAlert', {
                                        error : true,
                                        message : $filter( 'i18next' )( 'projects.projectAssign.errorData' ) } );
                })
                .finally( function() {
                    $scope.spinners.projects = false;
                });
        });

        $scope.activeThisProject = function( project ) {
            $scope.spinners.users = true;
            $scope.$parent.$parent.currentMode.obj  = project;
            $scope.$parent.$parent.currentMode.type = 'projects';
            // set active to true for selected item
            ProjectsFactory.setActiveItem( $scope.projects, project._id );
            // get all users that belong to selected project
            ProjectsFactory.getUsersByProjectId( project._id )
                .then( function ( users ) {
                    ProjectsFactory.toAddActiveField( users.users ); // create and set all users items with 'active = false' field
                    $scope.$emit( 'sendFilteredUsers', { users : users } );
                })
                .catch( function ( err ) {
                    $rootScope.$broadcast( 'messageAlert', {
                                        error : true,
                                        message : $filter( 'i18next' )( 'projects.projectAssign.errorData' ) } );
                })
                .finally( function() {
                    $scope.spinners.users = false;
                });
        };

        // receiving event from controller.user when an user is clicked
        $scope.$on( 'sendFilteredProjects', function( event, filteredProjects ) {
            $scope.projects = filteredProjects.projects;
            ProjectsFactory.setItemsOcurrences( $scope.projects ); // get and set number of ocurrences on ProjectUser entity
        });

        // when a relationship is added or erased, we need to refresh the User view list. It comes from controller.marcate
        $rootScope.$on( 'refreshactiveThisProject', function( event, data ) {
            $scope.activeThisProject( $scope.$parent.$parent.currentMode.obj ); // to refresh users items list view
            ProjectsFactory.setItemsOcurrences( $scope.projects ); // get and set number of ocurrences on ProjectUser entity
        });

    }

}());
