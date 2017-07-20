;( function () {
    'use strict';
    angular
        .module( 'hours.timeout', [] )
        .service( 'timeoutService', timeoutService );

    timeoutService.$invoke = [ '$rootScope' ];
    function timeoutService( $rootScope ) {

        this.sayHello = function() {
            return 'Hi! This is timeoutService';
        }
        $rootScope.$on('IdleStart', function() {
            console.log('IdleStart');
    	});
        $rootScope.$on('IdleWarn', function(e, countdown) {
            console.log('*******IdleWarn********');
	    });
	    $rootScope.$on('IdleTimeout', function() {
            console.log('IdleTimeout');
	    });
	    $rootScope.$on('IdleEnd', function() {
            console.log('IdleEnd');
	    });
	    $rootScope.$on('Keepalive', function() {
            console.log('Keepalive');
		// do something to keep the user's session alive
	    });

    }
}());
