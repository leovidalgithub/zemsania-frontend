;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ProjectAssignProjectController', ProjectAssignProjectController );

    ProjectAssignProjectController.$invoke = [ '$scope', 'ProjectsFactory', '$uibModal' ];
    function ProjectAssignProjectController( $scope, ProjectsFactory, $uibModal  ) {

        $scope.openProjectInfo = function ( project, event ) {
            event.preventDefault();
            event.stopPropagation();
            var modalInstance = $uibModal.open( {
                animation: true,
                templateUrl: '/features/projects/projectAssign/modals/modalProjectInfo.tpl.html',
                controller : 'ModalInfo',
                resolve : {
                    data : project
                }
            }).result.then( function() {}, function( res ) {} ); // to avoid: 'Possibly unhandled rejection: backdrop click'
        };

        $scope.$on( 'toSearchEvent', function( event, data ) {
            $scope.spinners.projects = true;
            ProjectsFactory.advancedProjectSearch( data.searchText )
                .then( function ( data ) {
                    ProjectsFactory.toAddActiveField( data.projects );
                    $scope.projects = data.projects;
                })
                .catch( function ( err ) {
                })
                .finally( function() {
                    $scope.spinners.projects = false;
                });
        });

        $scope.activeThisProject = function( project ) {
            $scope.$parent.$parent.currentMode.obj = project;
            $scope.$parent.$parent.currentMode.type = 'projects';
            // set active to true for selected item
            ProjectsFactory.setActiveItem( $scope.projects, project._id );
            // get all users that belong to selected project
            ProjectsFactory.getUsersByProjectId( project._id )
                .then( function ( users ) {
                    // create and set all users items with 'active = false' field 
                    ProjectsFactory.toAddActiveField( users.users );
                    $scope.$emit( 'sendFilteredUsers', { users : users } );
                })
                .catch( function ( err ) {
                })
                .finally( function() {
                });
        };

        $scope.$on( 'sendFilteredProjects', function( event, filteredProjects ) {
            $scope.projects = filteredProjects.projects;
        });

    }

}());
