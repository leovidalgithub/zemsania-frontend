;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ProjectAssignController', ProjectAssignController );
        // .controller( 'ModalAddUserToProject',   ModalAddUserToProject )
        // .controller( 'ModalUserInfo',           ModalUserInfo );

    ProjectAssignController.$invoke = [ '$scope', 'ProjectsFactory', '$uibModal', '$timeout' ];
    function ProjectAssignController( $scope, ProjectsFactory, $uibModal, $timeout ) {

        $scope.spinners = {
                    projects : false,
                    users    : false
        };
        $scope.currentMode = {
                    obj  : {},
                    type : 'none', // it can be: 'none', 'projects' or 'users'
        };

        $scope.searchProject = function ( searchText ) {
            $scope.currentMode.type = 'none';
            $scope.currentMode.obj  = {};
            $scope.$broadcast( 'toSearchEvent', { searchText : searchText } );
        };

        $timeout( function() { // search input set_focus
            $scope.$broadcast( 'toSearchEvent', { searchText : '1' } );
            document.getElementById( 'searchInput' ).focus();
        }, 900 );

        $scope.removeThis = function( obj, event ) {
            event.preventDefault();
            event.stopPropagation();
            var user    = $scope.currentMode.type == 'users' ? $scope.currentMode.obj : obj;
            var project = $scope.currentMode.type == 'projects' ? $scope.currentMode.obj : obj;
            var pepe = angular.copy( $scope.currentMode );

            // MODAL - WARNING BEFORE REMOVING PROJECT-USER RELATIONSHIP
            var modalPendingChangesInstance = $uibModal.open( {
            animation : true,
            ariaLabelledBy : 'modal-title',
            ariaDescribedBy : 'modal-body',
            templateUrl : '/features/projects/projectAssign/modals/warningRemoveModal.tpl.html',
            controller : 'ModalInfo',
            resolve : {
                data : {
                    user    : user,
                    project : project
                }
            },
            backdrop: 'static',
            size: 'sm',
            }).result.then( function() {}, function( res ) {} ); // to avoid: 'Possibly unhandled rejection: backdrop click'
        };

    }

    // ModalUserInfo.$invoke = ['$scope', '$uibModalInstance', 'user'];
    // function ModalUserInfo($scope, $uibModalInstance, user) {
    // }

    // ModalAddUserToProject.$invoke = ['$scope', '$uibModalInstance', 'user', 'project'];
    // function ModalAddUserToProject($scope, $uibModalInstance, user, project) {
    // }

}());
