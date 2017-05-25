;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeTypeSummaryController', imputeTypeSummaryController );

    imputeTypeSummaryController.$invoke = [ '$scope', '$rootScope', '$uibModalInstance', 'data' ];
    function imputeTypeSummaryController( $scope, $rootScope, $uibModalInstance, data ) {

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
                                                      value : timesheets[ index ][ imputeSubType ].value } );
                    }
                }
            }
        });

        $scope.dayInfo = {
                day             : day.day,
                dayType         : day.dayType,
                imputeTypesInfo : imputeTypesInfo,
                totalHours      : imputeTypesSummary.totalHours
            };

        $scope.cancel = function() {
            $uibModalInstance.dismiss( 'cancel' );
        };

        $scope.goTo = function( imputeType, imputeSubType ) {
            $uibModalInstance.dismiss( 'cancel' );
            $scope.$emit('goToThisImputeType', { imputeType    : imputeType,
                                                 imputeSubType : imputeSubType,
                                                 dayTimestamp  : day.timeStamp } );
        };

}

})();
