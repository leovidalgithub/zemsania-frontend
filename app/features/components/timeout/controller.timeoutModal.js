;( function () {
    'use strict';
    angular
        .module( 'hours.timeout' )
        .controller( 'timeoutModalController', timeoutModalController );

    timeoutModalController.$invoke = [ '$scope', '$rootScope' ];
    function timeoutModalController( $scope, $rootScope ) {

        $scope.value = 100;
        $scope.remainingSeconds;
        var interval = 0;

        $rootScope.$on( 'timeoutCount', function( event, data ) {
            if ( interval === 0 ) {
                interval = $scope.value / data.data;
            }
            $scope.$apply( function() {
                $scope.remainingSeconds = data.data;
                $scope.value -= interval;
            });
        });


}

})();
