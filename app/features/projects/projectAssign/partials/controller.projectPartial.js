;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ProjectAssignProjectController', ProjectAssignProjectController );

    ProjectAssignProjectController.$invoke = [ '$scope', 'ProjectsFactory', '$uibModal', '$timeout' ];
    function ProjectAssignProjectController( $scope, ProjectsFactory, $uibModal, $timeout ) {
        

        $scope.$on( 'toFilterProjects', function( event, filter ) {
            $scope.projects = filter.projects;
        });

        $scope.$on( 'toSearchEvent', function( event, data ) {
            $scope.spinners.projects = true;
            ProjectsFactory.advancedProjectSearch( data.searchText )
                .then( function ( data ) {
                    $scope.projects = data.projects;
                })
                .catch( function ( err ) {

                })
                .finally( function() {
                    $scope.spinners.projects = false;
                });
        });

        $scope.activeThisProject = function( projectId ) {
            ProjectsFactory.getUsersById( projectId )
                .then( function ( data ) {
                })
                .catch( function ( err ) {
                })
                .finally( function() {
                });
        };




    }

}());