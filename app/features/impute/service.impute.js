( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .factory( 'imputeHoursFactory', imputeHoursFactory );

    imputeHoursFactory.$invoke = [ '$http', '$q' ];
    function imputeHoursFactory( $http, $q ) {
        return {

            getMonthWeeksObj : function ( month, year ) {
                var months     = [ 'january' ,'february' ,'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ];
                var dataDate     =  {},
                    firstDay     = new Date( year, month, 1 ),
                    lastDay      = new Date( year, month + 1, 0 ),
                    numDays      = lastDay.getDate(),
                    currentDay   = angular.copy( firstDay ),
                    currentMonth = firstDay.getMonth(),
                    monthInName  = months[ currentMonth ],
                    currentYear  = firstDay.getFullYear(),
                    week         = [];
                    dataDate     = {
                            firstDay : firstDay,
                            currentMonth : currentMonth,
                            currentYear : currentYear,
                            monthInName : monthInName,
                            weeks : []
                    };

                    while( true ) {
                        if( currentDay.getDate() == 1 && currentDay.getDay() != 1 ) { // just in case of last-month-final-days (to complete the week view)
                            var lastMonthFinalsDays = angular.copy( currentDay );
                            var tempArray = [];
                            while( true ) {
                                lastMonthFinalsDays.setDate( lastMonthFinalsDays.getDate() - 1 );
                                tempArray.push( new Date( lastMonthFinalsDays.getFullYear(), lastMonthFinalsDays.getMonth(), lastMonthFinalsDays.getDate() ) );
                                if( lastMonthFinalsDays.getDay() == 1 ) {
                                    week = tempArray.reverse().slice();
                                    break;
                                }
                            }
                        }
                        week.push( new Date( year, month, currentDay.getDate() ) );
                        if( currentDay.getDate() == numDays ) { // when gets at last day
                            if( currentDay.getDay() != 0 ) { // just in case of next-month-inital-days (to complete the week view)
                                while( true ) {
                                    currentDay.setDate( currentDay.getDate() + 1 );
                                    week.push( new Date( currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() ) );
                                    if( currentDay.getDay() == 0 ) {
                                        break;
                                    }
                                }
                            }
                            if ( week.length ) {
                                dataDate.weeks.push( week );
                            }
                            break;
                        }
                        currentDay = new Date( year, month, currentDay.getDate() + 1 );
                        if( currentDay.getDay() == 1 ) {
                            dataDate.weeks.push( week );
                            week = [];
                        }
                    }
                    return dataDate;
            }


            // getEmployeeList: function () { // LEO WAS HERE
            //     var dfd = $q.defer();
            //     $http.get( buildURL( 'getAllUsers' ) )
            //         .then( function ( response ) {
            //             if ( response.data.success ) {
            //                     dfd.resolve( response.data.users );
            //             } else {
            //                 dfd.reject( response );
            //             }
            //         }, function ( err ) {
            //             dfd.reject( err );
            //         });
            //     return dfd.promise;
            // }

        };
    }
}());




    // function getMonthWeeks( month, year ) {
    //     var weeks = [],
    //         firstDate = new Date( year, month, 1 ),
    //         lastDay  = new Date( year, month + 1, 0 ),
    //         numDays   = lastDay.getDate(),
    //         start     = 1,
    //         end       = 8 - firstDate.getDay();
    //    while( start <= numDays ){
    //        weeks.push( { start : start, end : end } );
    //        start = end + 1;
    //        end = end + 7;
    //        if( end > numDays ) end = numDays;
    //    }
    //     return weeks;
    // }
