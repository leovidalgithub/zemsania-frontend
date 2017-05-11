;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ModalProjectInfo', ModalProjectInfo );

    ModalProjectInfo.$invoke = [ '$scope', '$uibModalInstance', 'project' ];
    function ModalProjectInfo( $scope, $uibModalInstance, project ) {

        $scope.project = project;

        $scope.cancel = function () {
            $uibModalInstance.dismiss( 'cancel' );
        };

    }


}());