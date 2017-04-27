;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .controller( 'approvalHoursController', approvalHoursController )

    approvalHoursController.$invoke = [ '$scope', 'approvalHoursFactory', '$timeout' ];
    function approvalHoursController( $scope, approvalHoursFactory, $timeout ) {

        $scope.obj = [
                    { name : 'Leonardo Rodríguez Vidal', hi : 36, opened : false, _id : '3r58d33j5903a034' },
                    { name : 'Lorenzo Barja Rodríguez', hi : 123, opened : false, _id : '3r58d33j5903a035' },
                    { name : 'Ana Escribano', hi : 44, opened : false, _id : '3r58d33j5903a036' },
                    { name : 'Joaquín Crespo', hi : 9, opened : false, _id : '3r58d33j5903a037' },
                    { name : 'Mónica Pascualotte', hi : 79, opened : false, _id : '3r58d33j5903a038' }
        ];

        $scope.myEmployeeClick = function( employeeId ) {
            var employeeElement = $( '#' + employeeId );
            employeeElement.collapse( 'toggle' );
            var openStatus = employeeElement.attr( 'aria-expanded' );
            var employee = $scope.obj.find( function( employee ) {
                return employee._id === employeeId;
            });
            employee.opened = ( openStatus === 'true' );


        };

        // $scope.fn = function() {
        // };
    
    }

}());
