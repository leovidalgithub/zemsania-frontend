;( function () {
    'use strict';
    angular
        .module( 'hours.projects' )
        .controller( 'ModalInfo', ModalInfo );

    ModalInfo.$invoke = [ '$scope', '$uibModalInstance', 'data' ];
    function ModalInfo( $scope, $uibModalInstance, data ) {

        $scope.data = data;

        $scope.doIt = function () {
            console.log('removing...');
            $uibModalInstance.dismiss( 'cancel' );
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss( 'cancel' );
        };

    }


}());