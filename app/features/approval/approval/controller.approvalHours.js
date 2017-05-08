;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .controller( 'approvalHoursController', approvalHoursController )

    approvalHoursController.$invoke = [ '$scope', 'approvalHoursFactory', '$timeout', '$http', 'imputeHoursFactory', '$filter', '$window' ];
    function approvalHoursController( $scope, approvalHoursFactory, $timeout, $http, imputeHoursFactory, $filter, $window ) {

        var currentDate  = new Date();
        $scope.mainOBJ = {};
        $scope.alerts = {};
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

        (function init() {
            getData();
        })();

        function getData() {
            approvalHoursFactory.getEmployeesTimesheets( $scope.mainOBJ )
                .then( function ( data ) {
                    console.log(data);
                    console.log(data);
                    console.log(data);
                    $scope.employees = data;
                    imputesCount();
                    initialSlick();
                })
                .catch( function ( err ) {
                    $scope.alerts.error = true; // error code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'approvalHours.errorLoading' );; // error message alert
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

        function initialSlick() {
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

        }

        // WHEN USER CLICKS ON ANY APPROVAL OR REJECT BUTTON
        $scope.setDays = function( approved, _employeeId, _projectId, _imputeType, _imputeSubType, _dayTimestamp, _dayApproved ) {
            var projectsObj = {}; // object to send data to backend to set timesheets 
            // when click directly on a day
            if( _dayTimestamp && _dayApproved ) {
                approved = _dayApproved == 'NA' ? true : !_dayApproved;
            }

            var newStatus = approved ? 'approved' : 'rejected';

            // find employee
            var employee = $scope.employees.find( function( employee ) {
                return employee.employeeId == _employeeId;
            });

            // start to find through projects
            for( var projectId in employee.timesheetDataModel ) {
                // if _projectId has value, so it will be filter to work just over that _projectId
                if( _projectId && projectId != _projectId ) continue;

                // find through days inside each project
                for( var day in employee.timesheetDataModel[ projectId ] ) {
                    
                    // if _dayTimestamp has value, so it will be filter to work just over that day
                    if( _dayTimestamp && day != _dayTimestamp ) continue;
                    if( day == 'info' ) continue; // 'info' is where all project info is stored, so, it is necessary to skip it

                        // find through imputeTypes inside each day
                        for( var imputeType in employee.timesheetDataModel[ projectId ][ day ] ) {
                            // if _imputeType has value, so it will be filter to work just over that _imputeType
                            if( _imputeType && imputeType != _imputeType ) continue;

                            // find through imputeSubTypes inside each imputeTypes
                            for( var imputeSubType in employee.timesheetDataModel[ projectId ][ day ][ imputeType ] ) {
                                // if _imputeSubType has value, so it will be filter to work just over that _imputeSubType
                                if( _imputeSubType && imputeSubType != _imputeSubType ) continue;

                                // enabled when status = 'sent'
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

            // it finds 'day' inside 'project.info.tables.tableName.days' and sets 'approved'
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
                    $scope.alerts.error = false; // ok code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'approvalHours.okSaving' );; // ok message alert
                })
                .catch( function( err ) { // error on saving data
                    $scope.alerts.error = true; // error code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'approvalHours.errorSaving' );; // error message alert
                });
        };

        // FUNCTION FOR SHOW ALL EMPLOYESS OR JUST EMPLOYEES WITH PENDING APPROVALS
        $scope.showEmployee = function( isPending ) {
            if( $scope.mainOBJ.allEmployees == 'true' ) {
                return true;
            } else {
                return isPending;
            }
        };

        // IT COUNTS EVERY EMPLOYEE WITH PENDING APPROVAL IN ORDER TO SHOW ON RIGHT-SIDE HEADER
        function imputesCount() {
            $scope.mainOBJ.imputesCount = 0;
            $scope.employees.forEach( function( employee ) {
                if( employee.isPending ) $scope.mainOBJ.imputesCount++;
            });

        }

        // MOVING THROUGH MONTHS
        $scope.moveDate = function( moveTo ) {
                $scope.mainOBJ.currentMonth+= moveTo;
                if( $scope.mainOBJ.currentMonth == 12 ) {
                    $scope.mainOBJ.currentMonth = 0;
                    $scope.mainOBJ.currentYear++;
                } else if ( $scope.mainOBJ.currentMonth == -1 ) {
                    $scope.mainOBJ.currentMonth = 11;
                    $scope.mainOBJ.currentYear--;
                }
                getData();
        };

    }

}());
