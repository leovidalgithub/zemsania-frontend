;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ProjectAssignController', ProjectAssignController );
        // .controller( 'ModalProjectInfo',        ModalProjectInfo )
        // .controller( 'ModalAddUserToProject',   ModalAddUserToProject )
        // .controller( 'ModalUserInfo',           ModalUserInfo );

    ProjectAssignController.$invoke = [ '$scope', 'ProjectsFactory', '$uibModal' ];
    function ProjectAssignController( $scope, ProjectsFactory, $uibModal ) {

        // $scope.openProject = null;
        // $scope.advancedSearchVisible = false;
        // $scope.loadingProjectUsers = null;

        $scope.searchProject = function ( searchText ) {
            ProjectsFactory.advancedProjectSearch( searchText )
                .then( function ( data ) {
                    $scope.projects = data.projects;
                })
                .catch( function ( err ) {

                });
        };

        $scope.openInfo = function ( project ) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/features/projects/projectAssign/modals/modalProjectInfo.tpl.html',
                controller: 'ModalProjectInfo',
                resolve: {
                    project: project
                }
            });
        };

        (function Init( search ) {
            $scope.searchProject( search );
        })('1');


    }

    // ModalProjectInfo.$invoke = ['$scope', '$uibModalInstance', 'project'];
    // function ModalProjectInfo($scope, $uibModalInstance, project) {
    // }

    // ModalUserInfo.$invoke = ['$scope', '$uibModalInstance', 'user'];
    // function ModalUserInfo($scope, $uibModalInstance, user) {
    // }

    // ModalAddUserToProject.$invoke = ['$scope', '$uibModalInstance', 'user', 'project'];
    // function ModalAddUserToProject($scope, $uibModalInstance, user, project) {
    // }

}());