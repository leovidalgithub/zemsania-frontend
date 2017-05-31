;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ModalInfo', ModalInfo );

    ModalInfo.$invoke = [ '$scope', '$uibModalInstance', 'data' ];
    function ModalInfo( $scope, $uibModalInstance, data ) {

        $scope.data = data;

        $scope.cancel = function () {
            $uibModalInstance.dismiss( 'cancel' );
        };

    }

}());
