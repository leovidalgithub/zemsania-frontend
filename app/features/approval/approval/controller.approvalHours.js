;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .controller( 'approvalHoursController', approvalHoursController )

    approvalHoursController.$invoke = [ '$scope', 'approvalHoursFactory', '$timeout', '$http' ];
    function approvalHoursController( $scope, approvalHoursFactory, $timeout, $http ) {

        $timeout( function() {
            $scope.mainOBJ.searchText = 'leo';
        }, 900 );

        var currentDate  = new Date();
        $scope.mainOBJ = {};
        $scope.mainOBJ = {
                            currentDate          : currentDate,
                            currentDateTimestamp : currentDate.getTime(),
                            currentMonth         : currentDate.getMonth(),
                            currentYear          : currentDate.getFullYear(),
                            currentFirstDay      : new Date( currentDate.getFullYear(), currentDate.getMonth(), 1 ),
                            currentLastDay       : new Date( currentDate.getFullYear(), currentDate.getMonth() + 1, 0 ),
                            totalMonthDays       : new Date( currentDate.getFullYear(), currentDate.getMonth() + 1, 0 ).getDate(),                            
                            allEmployees         : 'true',
                            searchText           : ''
                        };

        init();
        function init() {
            approvalHoursFactory.getEmployeesTimesheets( $scope.mainOBJ )
                .then( function ( data ) { 
                    $scope.employees = data;
                    console.log($scope.employees);
                })
                .catch( function ( err ) {
                });
        }

        $scope.myEmployeeClick = function( employeeId ) {
            var openStatus = collapseToggle( employeeId );
            var employee = $scope.employees.find( function( employee ) {
                return employee.employeeId === employeeId;
            });
            employee.opened = ( openStatus === 'true' );
        };


        $scope.myProjectClick = function( employeeId, projectId ) {
            console.log(projectId);
            var openStatus = collapseToggle( projectId );
            var employee = $scope.employees.find( function( employee ) {
                return employee.employeeId === employeeId;
            });
            employee.timesheetDataModel[ projectId ].info.opened =  ( openStatus === 'true' );
        };

        // to collapse toggle of table views
        function collapseToggle( id ) {
            var element = $( '#' + id );
            element.collapse( 'toggle' );
            return element.attr( 'aria-expanded' ); // to know if it is collapsed or not
        }

        $( document ).ready( function() {
            $timeout( function() {
                  $( '.slickTable' ).slick({
                    dots: true,
                    infinite : false,
                    slidesToShow: 5,
                    slidesToScroll: 3,
                    variableWidth : true,
                    // autoplay : true,
                    // autoplaySpeed : 600,
                    // adaptiveHeight : true,
                    arrows : false,
                    // speed : 300,
                    // centerMode : true,
                  });
            }, 500 );
        });

        $scope.dayClick = function( employeeId, projectId, tableName, day, approved ) {
            approved = approved == 'NA' ? true : !approved;
            $scope.employees.forEach( function( employee ) {
                if( employee.employeeId == employeeId ) {
                    if( employee.timesheetDataModel[ projectId ] ) {
                        if( employee.timesheetDataModel[ projectId ].info.tables[ tableName ] ) {
                            var table = employee.timesheetDataModel[ projectId ].info.tables[ tableName ];
                            var dayToSet = table.days.find( function( dayObj ) {
                                        return dayObj.day == day;
                                    });
                            dayToSet.approved = approved;
                        }
                    }
                }
            });
        };

        $scope.notNameFunction = function( approved, level, employeeId, projectId ) {

            var employee = $scope.employees.find( function( employee ) {
                return employee.employeeId == employeeId;
            });

            console.log(employee);
            //VOY POR AQUÍ 
            //VOY POR AQUÍ 
            //VOY POR AQUÍ 
            //VOY POR AQUÍ 
            //VOY POR AQUÍ 
            //VOY POR AQUÍ 
            //VOY POR AQUÍ 
            //VOY POR AQUÍ

                //     if( employee.timesheetDataModel[ projectId ] ) {
                //         if( employee.timesheetDataModel[ projectId ].info.tables[ tableName ] ) {
                //             var table = employee.timesheetDataModel[ projectId ].info.tables[ tableName ];
                //             var dayToSet = table.days.find( function( dayObj ) {
                //                         return dayObj.day == day;
                //                     });
                //             dayToSet.approved = approved;
                //         }
                //     }


        };




    }

}());
