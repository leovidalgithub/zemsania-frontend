;( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .controller( 'imputeTypeSummaryController', imputeTypeSummaryController );

    imputeTypeSummaryController.$invoke = [ '$scope', '$rootScope', '$uibModalInstance', 'data' ];
    function imputeTypeSummaryController( $scope, $rootScope, $uibModalInstance, data ) {


// console.log(data.myDayId);
// console.log(data.imputeTypesSummary);
// console.log(data.dayType);
// console.log(data.day);
// console.log(data.ts);

for( var project in data.ts ) {
    console.log(project);
}



        $scope.cancel = function() {
            $uibModalInstance.dismiss( 'cancel' );
        };
                


}

})();
