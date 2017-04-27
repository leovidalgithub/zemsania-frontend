;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .factory( 'approvalHoursFactory', approvalHoursFactory )

    approvalHoursFactory.$invoke = [ '$http', '$q' ];

    function approvalHoursFactory( $http, $q ) {
        return {
            // getName : function( value ) {
            // }
        }
    }

}());
