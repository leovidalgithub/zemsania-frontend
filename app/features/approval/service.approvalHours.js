;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .factory( 'approvalHoursFactory', approvalHoursFactory )

    approvalHoursFactory.$invoke = [ '$http', '$q', 'UserFactory' ];

    function approvalHoursFactory( $http, $q, UserFactory ) {
        return {

            getEmployeesTimesheets: function ( month, year ) { // LEO WAS HERE
                var managerId = UserFactory.getUserID();
                var dfd = $q.defer();
                $http.get( buildURL( 'getEmployeesTimesheets' ) + managerId + '?month=' + month + '&year=' + year )
                    .then( prepareTimesheetsData.bind( null, dfd ) )
                    .catch( function ( err ) {
                        console.log('err');
                        dfd.reject( err );
                    });
                return dfd.promise;
            }

        }

        function prepareTimesheetsData( dfd, data ) {
// IF SOME REGISTER IS ON SENT ----> BOOLEAN WITH 'SÓLO PENDIENTES'
            data.data.employeesArray.forEach( function( employee ) {
                employee.opened = false;
                var totalImputeHours = 0;
                for( var projectId in employee.timesheetDataModel ) {
                    employee.timesheetDataModel[ projectId ].opened = false;
                    var imputeHours = 0;
                    for( var day in employee.timesheetDataModel[ projectId ] ) {
                        for( var type in employee.timesheetDataModel[ projectId ][ day ] ) {
                            if( type != 'Guardias' ) { // calculate just 'Hours'. 'Guardias' are not taken in account here.
                                for( var subType in employee.timesheetDataModel[ projectId ][ day ][ type ] ) {
                                    var value = employee.timesheetDataModel[ projectId ][ day ][ type ][ subType ].value;
                                    totalImputeHours+= value;
                                    imputeHours+= value;

                                    console.log(employee.timesheetDataModel[ projectId ][ day ][ type ][ subType ].status);
                                }
                            }
                        }
                    }
                    employee.timesheetDataModel[ projectId ].imputeHours = imputeHours;
                }
                employee.totalImputeHours = totalImputeHours;
            });
            console.log(data.data);
            findForSentStatus( data );

            return dfd.resolve( data.data );
        }

        function findForSentStatus( data ) {
            data.data.employeesArray.forEach( function( employee ) {




            });

 
        }

    }

}());
