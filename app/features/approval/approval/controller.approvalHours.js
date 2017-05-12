;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .controller( 'approvalHoursController', approvalHoursController )

    approvalHoursController.$invoke = [ '$scope', '$rootScope', 'approvalHoursFactory', '$timeout', 'imputeHoursFactory', '$filter' ];
    function approvalHoursController( $scope, $rootScope, approvalHoursFactory, $timeout, imputeHoursFactory, $filter ) {

        ( function init() {
            var currentDate;
            if( $rootScope.notification ) { // if it comes from notification it takes the date from that notification
                currentDate = new Date( $rootScope.notification.issueDate.year, $rootScope.notification.issueDate.month, 1 );
            } else { // otherwise it will show the data from current month and year
                currentDate = new Date();
            }

            $scope.alerts   = {};
            $scope.mainOBJ  = {};
            $scope.mainOBJ  = {
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
            getData();
        })();

        function getData() {
            approvalHoursFactory.getEmployeesTimesheets( $scope.mainOBJ )
                .then( function ( data ) {
                    $scope.employees = data;
                    imputesCount();
                    initialSlick();
                    if( $rootScope.notification ) showNotificationData();
                })
                .catch( function ( err ) {
                    console.log('err');
                    console.log(err);
                    $scope.alerts.error = true; // error code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'approvalHours.errorLoading' ); // error message alert
                });
        }

        $scope.myEmployeeClick = function( employeeId ) {
            var openStatus = collapseToggle( employeeId );
            var employee = getEmployee( employeeId );
            employee.opened = ( openStatus === 'true' );
        };


        $scope.myProjectClick = function( employeeId, projectId ) {
            var openStatus = collapseToggle( projectId );
            var employee = getEmployee( employeeId );
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
                    slidesToScroll: 4,
                    variableWidth : true,
                    arrows : false
                    // autoplay : true,
                    // autoplaySpeed : 600,
                    // adaptiveHeight : true,
                    // speed : 300,
                    // centerMode : true,
                  });
            }, 500 );
        }

        // WHEN USER CLICKS ON ANY APPROVAL OR REJECT BUTTON. THERE ARE 4 LEVEL OF APPROVAL/REJECT CLICKS
        // 1 EMPLOYEE LEVEL - ACTION OVER ALL EMPLOYEE DATA
        // 2 PROJECT LEVEL  - ACTION OVER CURRENT PROJECT
        // 3 TABLE LEVEL    - ACTION OVER A TABLE INSIDE A CURRENT PROJECT
        // 4 DAY LEVEL      - ACTION OVER A PARTICULAR DAY OF A TABLE INSIDE A CURRENT PROJECT
        $scope.setDays = function( approved, _employeeId, _projectId, _imputeType, _imputeSubType, _dayTimestamp, _dayApproved ) {
            var projectsObj = {}; // object to send data to backend to set timesheets 
            // when click directly on a particular day
            if( _dayTimestamp && _dayApproved ) {
                approved = _dayApproved == 'NA' ? true : !_dayApproved;
            }

            var newStatus = approved ? 'approved' : 'rejected';

            // find employee
            var employee = getEmployee( _employeeId );

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
                    $scope.alerts.message = $filter( 'i18next' )( 'approvalHours.okSaving' ); // ok message alert
                })
                .catch( function( err ) {
                    $scope.alerts.error = true; // error code alert
                    $scope.alerts.message = $filter( 'i18next' )( 'approvalHours.errorSaving' ); // error message alert
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

        // WHEN IT COMES FROM NOTIFICATION TO SHOW THE APPROVAL DATA ACCORDING TO THAT NOTIFICATION
        function showNotificationData() {
            var senderId = $rootScope.notification.senderId;
            var idLength = senderId.length;
            var employee = getEmployee( senderId );
            $scope.mainOBJ.searchText = senderId.substring( idLength - 12 );
            $rootScope.notification   = null;

            $timeout( function() {
                for( var project in employee.timesheetDataModel ) {
                    collapseToggle( project );
                    employee.timesheetDataModel[project].info.opened = true;
                }
                collapseToggle( senderId );
                employee.opened = true;                    
            }, 800 );
        }

        function getEmployee( id ) {
            return $scope.employees.find( function( employee ) {
                return employee.employeeId === id;
            });
        }

    }

}());
