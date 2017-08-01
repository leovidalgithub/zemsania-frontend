;( function () {
    'use strict';
    angular
        .module( 'hours.timeout', [] )
        .controller( 'timeoutController', timeoutController );

    timeoutController.$invoke = [ '$scope', '$rootScope', '$uibModal', '$state', '$uibModalStack' ];
    function timeoutController( $scope, $rootScope, $uibModal, $state, $uibModalStack ) {

        $scope.$on( 'IdleStart', function() { // start idle warning
            openModal();
    	});
        $scope.$on( 'IdleWarn', function( e, countdown ) { // timeout every second countdown
            $rootScope.$emit( 'timeoutCount', { data : countdown });
	    });
	    $scope.$on( 'IdleTimeout', function() { // logout
            logout( true );
	    });
	    $scope.$on( 'IdleEnd', function() { // resume before timeout
            logout( false );
	    });
	    $scope.$on('Keepalive', function() { // do something to keep the user's session alive
	    });

        function logout( logout ) {
            $uibModalStack.dismissAll();
            if( logout ) $state.go( 'logout' );
        };

        function openModal() {
            $uibModal.open( {
                animation : true,
                templateUrl : '/features/components/timeout/timeout.tpl.html',
                controller : 'timeoutModalController',
                backdrop: 'false',
                size: 'md',
                resolve: {
                },
            });
        }
}

})();
