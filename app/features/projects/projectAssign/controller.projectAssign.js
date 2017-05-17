;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ProjectAssignController', ProjectAssignController );
        // .controller( 'ModalAddUserToProject',   ModalAddUserToProject )
        // .controller( 'ModalUserInfo',           ModalUserInfo );

    ProjectAssignController.$invoke = [ '$scope', 'ProjectsFactory', '$uibModal', '$timeout' ];
    function ProjectAssignController( $scope, ProjectsFactory, $uibModal, $timeout ) {

        // $scope.openProject = null;
        // $scope.advancedSearchVisible = false;
        // $scope.loadingProjectUsers = null;
        $scope.spinners = {
            projects : false,
            users    : false
        };

        $scope.searchProject = function ( searchText ) {
            $scope.$broadcast( 'toSearchEvent', { searchText : searchText } );
        };

        $scope.openInfo = function ( project ) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/features/projects/projectAssign/modals/modalProjectInfo.tpl.html',
                controller: 'ModalProjectInfo',
                resolve: {
                    project: project
                }
            }).result.then( function() {}, function( res ) {} ); // to avoid: 'Possibly unhandled rejection: backdrop click'
        };

        $timeout( function() { // search input set_focus
            $scope.$broadcast( 'toSearchEvent', { searchText : '1' } );
            document.getElementById( 'searchInput' ).focus();
        }, 800 );
    
    }

    // ModalUserInfo.$invoke = ['$scope', '$uibModalInstance', 'user'];
    // function ModalUserInfo($scope, $uibModalInstance, user) {
    // }

    // ModalAddUserToProject.$invoke = ['$scope', '$uibModalInstance', 'user', 'project'];
    // function ModalAddUserToProject($scope, $uibModalInstance, user, project) {
    // }

}());
