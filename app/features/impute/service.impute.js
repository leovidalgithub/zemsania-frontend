( function () {
    'use strict';
    angular
        .module( 'hours.impute' )
        .factory( 'imputeHoursFactory', imputeHoursFactory );

    imputeHoursFactory.$invoke = [ '$http', '$q', 'UserFactory' ];
    function imputeHoursFactory( $http, $q, UserFactory ) {
        return {

            getProjectsByUserId: function () { // LEO WAS HERE
                var userID = UserFactory.getUserID();
                var dfd = $q.defer();
                $http.get( buildURL( 'getProjectsByUserId' ) + userID )
                    .then( function ( response ) {
                        dfd.resolve( response.data.projects );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getTimesheets: function ( year, month ) { // LEO WAS HERE
                var userID = UserFactory.getUserID();
                var dfd    = $q.defer();
                $http.get( buildURL( 'getTimesheets' ) + userID + '?year=' + year + '&month=' + month )
                    .then( function ( response ) {
                        dfd.resolve( response );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            setAllTimesheets: function( data ) { // LEO WORKING HERE
                var userID = UserFactory.getUserID();
                var dfd = $q.defer();
                $http.post( buildURL( 'setAllTimesheets' ) + userID, data )
                    .then( function ( response ) {
                        dfd.resolve( response );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getShowDaysObj : function ( month, year, currentWeekAtFirst ) { // LEO WAS HERE
                var months          = [ 'january' ,'february' ,'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ];
                var currentFirstDay = new Date( year, month, 1 ),
                    currentLastDay  = new Date( year, month + 1, 0 ),
                    totalMonthDays  = currentLastDay.getDate(),
                    currentDay      = angular.copy( currentFirstDay ),
                    currentMonth    = currentFirstDay.getMonth(),
                    monthName       = months[ currentMonth ],
                    currentYear     = currentFirstDay.getFullYear(),
                    week            = 0; // number of the week inside month

                var showDaysObj             = {};
                showDaysObj.currentWeek     = 0;
                showDaysObj.currentFirstDay = currentFirstDay;
                showDaysObj.currentLastDay  = currentLastDay;
                showDaysObj.totalMonthDays  = totalMonthDays;
                showDaysObj.currentMonth    = currentMonth;
                showDaysObj.currentYear     = currentYear;
                showDaysObj.monthName       = monthName;
                showDaysObj.weeks           = {};

                while( true ) {
                    if( currentDay.getDate() == 1 && currentDay.getDay() != 1 ) { // just in case of last-month-final-days (to complete the week view)
                        var lastMonthFinalsDays = angular.copy( currentDay );
                        var tempArray = [];
                        while( true ) {
                            lastMonthFinalsDays.setDate( lastMonthFinalsDays.getDate() - 1 );
                            var day = new Date( lastMonthFinalsDays.getFullYear(), lastMonthFinalsDays.getMonth(), lastMonthFinalsDays.getDate() );
                            tempArray.push( day );
                            if( lastMonthFinalsDays.getDay() == 1 ) {
                                tempArray = tempArray.reverse();
                                tempArray.forEach( function( day ) {
                                    addNewDay( day, week );
                                })
                                break;
                            }
                        }
                    }
                    
                    var day = new Date( new Date( year, month, currentDay.getDate() ) );
                    addNewDay( day, week );

                    if( currentDay.getDate() == totalMonthDays ) { // when gets at last day
                        if( currentDay.getDay() != 0 ) { // just in case of next-month-inital-days (to complete the days view)
                            while( true ) {
                                currentDay.setDate( currentDay.getDate() + 1 );

                                var day = new Date( new Date( currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() ) );
                                addNewDay( day, week );

                                if( currentDay.getDay() == 0 ) {
                                    break;
                                }
                            }
                        }
                        break;
                    }
                    
                    currentDay = new Date( year, month, currentDay.getDate() + 1 );
                    if( currentDay.getDay() == 1 ) { // when week ends and start a new one
                        week++;
                    }
                }

                showDaysObj.totalMonthWeeks = week + 1;

                function addNewDay( day, week ) {
                    if ( !showDaysObj.weeks[ week ] ) showDaysObj.weeks[ week ] = {};
                    if ( !showDaysObj.weeks[ week ][ day ] ) showDaysObj.weeks[ week ][ day ] = {};
                    showDaysObj.weeks[ week ][ day ] = {
                                                day         : day,
                                                value       : 0, // it stores 'Horas/Variables' text value
                                                week        : week,
                                                thisMonth   : day.getMonth(),
                                                inputType   : 'text', // 'text' for 'Horas' and 'Variables', and 'checkbox' for 'Guardias'
                                                checkValue  : false // it stores 'Guardias' checkbox value
                                            };
                }
                return showDaysObj;
            }
        };
    }
}());
