;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .controller( 'approvalHoursController', approvalHoursController )

    approvalHoursController.$invoke = [ '$scope', 'approvalHoursFactory', '$timeout' ];
    function approvalHoursController( $scope, approvalHoursFactory, $timeout ) {

        var currentDate  = new Date();
        // var currentMonth = currentDate.getMonth();
        // var currentYear  = currentDate.getFullYear();
        $scope.mainOBJ = {};
        $scope.mainOBJ = {
                            currentDate          : currentDate,
                            currentDateTimestamp : currentDate.getTime(),
                            currentMonth         : currentDate.getMonth(),
                            currentYear          : currentDate.getFullYear(),
                            allEmployees         : 'true',
                            searchText           : ''
                        };
init();
        function init() {
            approvalHoursFactory.getEmployeesTimesheets( $scope.mainOBJ.currentMonth, $scope.mainOBJ.currentYear )
                .then( function ( data ) {
                    // console.log(data);
                })
                .catch( function ( err ) {
                });
        }



// ************************************************** MEN AT WORK **************************************************
        $scope.employees = [
                    { name : 'Leonardo Rodríguez Vidal', hi:36, htra:3, jtra:8, jaus:2, jvac:5, tgua:7, opened : false, _id : '3r58d33j5903a034' },
                    { name : 'Lorenzo Barja Rodríguez',  hi:123, htra:4, jtra:33, jaus:32, jvac:4, tgua:7, opened : false, _id : '3r58d33j5903a035' },
                    { name : 'Ana Escribano',            hi:44, htra:5, jtra:4, jaus:61, jvac:3, tgua:7, opened : false, _id : '3r58d33j5903a036' },
                    { name : 'Joaquín Crespo',           hi:9, htra:6, jtra:22, jaus:15, jvac:2, tgua:7, opened : false, _id : '3r58d33j5903a037' },
                    { name : 'Mónica Pascualotte',       hi : 79, htra:7, jtra:1, jaus:6, jvac:1, tgua:7, opened : false, _id : '3r58d33j5903a038' }
        ];

        $scope.myEmployeeClick = function( employeeId ) {
            var employeeElement = $( '#' + employeeId );
            employeeElement.collapse( 'toggle' );
            var openStatus = employeeElement.attr( 'aria-expanded' );
            var employee = $scope.employees.find( function( employee ) {
                return employee._id === employeeId;
            });
            employee.opened = ( openStatus === 'true' );


        };

        // $scope.fn = function() {
        //     console.log( $scope.employees );
        // };
    
    }

}());
