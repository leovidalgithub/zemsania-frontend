;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .controller( 'approvalHoursController', approvalHoursController )

    approvalHoursController.$invoke = [ '$scope', 'approvalHoursFactory', '$timeout', '$http', 'imputeHoursFactory' ];
    function approvalHoursController( $scope, approvalHoursFactory, $timeout, $http, imputeHoursFactory ) {

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
                            searchText           : '',
                            imputesCount         : 0
                        };

        init();
        function init() {
            approvalHoursFactory.getEmployeesTimesheets( $scope.mainOBJ )
                .then( function ( data ) { 
                    $scope.employees = data;
                    imputesCount();
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

        $scope.setDays = function( approved, _employeeId, _projectId, _imputeType, _imputeSubType, _dayTimestamp, _dayApproved ) {
            var projectsObj = {};
            if( _dayTimestamp && _dayApproved ) {
                approved = _dayApproved == 'NA' ? true : !_dayApproved;
            }

            var newStatus = approved ? 'approved' : 'rejected';

            var employee = $scope.employees.find( function( employee ) {
                return employee.employeeId == _employeeId;
            });

            for( var projectId in employee.timesheetDataModel ) {
                if( _projectId && projectId != _projectId ) continue;

                for( var day in employee.timesheetDataModel[ projectId ] ) {
                    if( _dayTimestamp && day != _dayTimestamp ) continue;
                    if( day == 'info' ) continue; // 'info' is where all project info is stored, so, it is necessary to skip it

                        for( var imputeType in employee.timesheetDataModel[ projectId ][ day ] ) {
                            if( _imputeType && imputeType != _imputeType ) continue;

                            for( var imputeSubType in employee.timesheetDataModel[ projectId ][ day ][ imputeType ] ) {
                                if( _imputeSubType && imputeSubType != _imputeSubType ) continue;

                                if( employee.timesheetDataModel[ projectId ][ day ][ imputeType ][ imputeSubType ].enabled ) {
                                    employee.timesheetDataModel[ projectId ][ day ][ imputeType ][ imputeSubType ].status   = newStatus;
                                    employee.timesheetDataModel[ projectId ][ day ][ imputeType ][ imputeSubType ].modified = true;
                                    var tableName = imputeType + '_' + imputeSubType;
                                    var infoObj = employee.timesheetDataModel[ projectId ].info;
                                    setDayTable( infoObj, tableName, day, approved );
                                }                                
                            }                            
                        }
                }
            if( !projectsObj[projectId] ) projectsObj[projectId] = {};
            projectsObj[projectId] = employee.timesheetDataModel[ projectId ];
            }

            function setDayTable( infoObj, tableName, day, approved ) {
                var currentDay = new Date( parseInt( day, 10) ).getDate();
                var dayObj = infoObj.tables[ tableName ].days.find( function( day ) {
                    return day.day == currentDay;
                });
                dayObj.approved = approved;
            }

            var wrapProjectsObj = [ projectsObj ];
            imputeHoursFactory.setAllTimesheets( wrapProjectsObj, _employeeId )
                .then( function( data ) {
                })
                .catch( function( err ) {
                    console.log('err');
                    console.log(err);
                });
        };

        $scope.showEmployee = function( isPending ) {
            if( $scope.mainOBJ.allEmployees == 'true' ) {
                return true;
            } else {
                return isPending;
            }
        };

        function imputesCount() {
            $scope.employees.forEach( function( employee ) {
                if( employee.isPending ) $scope.mainOBJ.imputesCount++;
            });

        }

        // $timeout( function() {
            // $scope.mainOBJ.searchText = 'leo';
        // }, 900 );

    }

}());
