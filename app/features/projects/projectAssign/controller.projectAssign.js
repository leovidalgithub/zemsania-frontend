;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ProjectAssignController', ProjectAssignController );
        // .controller( 'ModalProjectInfo',        ModalProjectInfo )
        // .controller( 'ModalAddUserToProject',   ModalAddUserToProject )
        // .controller( 'ModalUserInfo',           ModalUserInfo );

    ProjectAssignController.$invoke = [ '$scope', 'ProjectsFactory', '$uibModal', '$timeout' ];
    function ProjectAssignController( $scope, ProjectsFactory, $uibModal, $timeout ) {

        // (function Init( search ) {
        //     $scope.searchProject( search );
        // })('1');

        // $scope.openProject = null;
        // $scope.advancedSearchVisible = false;
        // $scope.loadingProjectUsers = null;
        $scope.spinners = {
            projects : false,
            users    : false
        };

        $scope.searchProject = function ( searchText ) {
            $scope.spinners.projects = true;
            ProjectsFactory.advancedProjectSearch( searchText )
                .then( function ( data ) {
                    $scope.projects = data.projects;
                })
                .catch( function ( err ) {

                })
                .finally( function() {
                    $scope.spinners.projects = false;
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

        $timeout( function() { // search input set_focus
            document.getElementById( 'searchInput' ).focus();
        }, 800 );
    
// };


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