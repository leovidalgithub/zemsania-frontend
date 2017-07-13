;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeTypeSummaryController', imputeTypeSummaryController );

    imputeTypeSummaryController.$invoke = [ '$scope', '$rootScope', '$uibModalInstance', 'data', '$timeout', '$filter' ];
    function imputeTypeSummaryController( $scope, $rootScope, $uibModalInstance, data, $timeout, $filter ) {

        var day                = data.day;
        var timesheets         = data.timesheets;
        var imputeTypes        = data.imputeTypes;
        var imputeTypesSummary = data.imputeTypesSummary;
        var imputeTypesInfo    = {};

        imputeTypes.forEach( function( el, index ) {
            if( timesheets[ index ] ) {
                if( !imputeTypesInfo[ el ] ) imputeTypesInfo[ el ] = [];
                for( var imputeSubType in timesheets[ index ] ) {
                    if( timesheets[ index ][ imputeSubType ].value ) {
                        imputeTypesInfo[ el ].push( { subType : imputeTypes[imputeTypes[ index ]][ imputeSubType ],
                                                      value : timesheets[ index ][ imputeSubType ].value,
                                                      status: timesheets[ index ][ imputeSubType ].status } );
                    }
                }
            }
        });

        $scope.dayInfo = {
                day              : day.day,
                dayType          : day.dayType,
                imputeTypesInfo  : imputeTypesInfo,
                totalHours       : imputeTypesSummary.totalHours,
                totalGlobalHours : imputeTypesSummary.totalGlobalHours
            };

        $scope.cancel = function() {
            $uibModalInstance.dismiss( 'cancel' );
        };

        $scope.goTo = function( imputeType, imputeSubType ) {
            $uibModalInstance.dismiss( 'cancel' );
            $scope.$emit( 'goToThisImputeType', { imputeType   : imputeType,
                                                 imputeSubType : imputeSubType,
                                                 dayTimestamp  : day.timeStamp } );
        };

        // tooltip messages over each imputeSubType
        $scope.giveMeTitlePlease = function( status ) {
            var title = '';
            switch ( status ) {
                case 'approved':
                    title = $filter( 'i18next' )( 'calendar.imputeHours.approved' );
                    break;
                case 'rejected':
                    title = $filter( 'i18next' )( 'calendar.imputeHours.rejected' );
                    break;
                case 'draft':
                    title = $filter( 'i18next' )( 'calendar.imputeHours.pendingToSend' );
                    break;
                case 'sent':
                    title = $filter( 'i18next' )( 'calendar.imputeHours.pendingToReview' );
                    break;
                default:
            }
            return title;
        };

        // bootstrap tooltip initializating
        $( document ).ready( function(){
            $timeout( function() {
                $( '[data-toggle="tooltip"]' ).tooltip();
            });
        });

}

})();
