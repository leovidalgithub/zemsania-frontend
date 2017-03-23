;( function () {
    'use strict';
    angular
        .module( 'hours.calendar' )
        .controller( 'editCalendarsController', editCalendarsController );

    editCalendarsController.$invoke = [ '$scope', 'CalendarFactory', '$stateParams', 'UserFactory', '$timeout', '$state' ];
    function editCalendarsController( $scope, CalendarFactory, $stateParams, UserFactory, $timeout, $state ) {

        var eventDates;
        var eventHours;
        $scope.loadingError = false;
        var currentYear     = new Date().getFullYear();
        $scope.yearShowed   = currentYear.toString();
        var locale      = UserFactory.getUser().locale;
        var monthsArray = [ 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ];
        var types       = { working : 'L-J', special : '', intensive : 'L-V', friday : 'V' };

        CalendarFactory.getCalendarById( $stateParams.id )
            .then( function( data ) {
                $scope.loadingError = false;
                $scope.calendar = data.calendar;
                eventHours = data.eventHours;
                eventDates = data.eventHours.eventDates;
                $timeout( function () {
                    showCalendars();
                }, 300 );
            })
            .catch( function( err ) {
                $scope.loadingError = true;
                $timeout( function () {
                    $state.go( 'calendars' );
                }, 2500 );
            });

        function showCalendars() {
            $.datepicker.setDefaults( // Initializing calendar language
                $.extend( $.datepicker.regional[ locale ] )
            );
            displayMonthsHours();
            displayRangeHours();
            createCalendarsHTML();
            var monthArray = [];
            monthArray = getMonthArrayByYear( $scope.yearShowed );
            var calendarNumber = 1;
            for ( var i = 0; i < monthArray.length; i++ ) {
                var calendar = '#calendar-' + calendarNumber++;
                showCalendar( calendar , monthArray[ i ] );
                // $( calendar + ' p' ).text( 'Total horas: xyz' );
            };
            resetCellsTitles();
        }

        function displayMonthsHours() {
            $scope.monthsHours = [];
            var thisYear =  eventHours.totalPerYear[ $scope.yearShowed ];
            if ( thisYear ) {
                for ( var month in thisYear ) {
                    $scope.monthsHours.push( { month : monthsArray[ month ], hours : thisYear[ month ].hours, minutes : thisYear[ month ].minutes } );
                }
            } else {
                for ( var month = 0; month < 12; month++ ) {
                    $scope.monthsHours.push( { month : monthsArray[ month ], hours :  0, minutes :  0 } );
                }
            }
        }

        function displayRangeHours() {
            for ( var type in types ) {
                var text = types[ type ] + ' ';                
                eventHours[ type ].forEach( function( element ) {
                    text += element.initialHour + '-' + element.endHour + ' ';
                });
                $( '#' + type + 'Range' ).html( '<code>' + text + '</code>' );
            }
        }

         function showCalendar( calendar, month ) {
            jQuery( calendar ).datepicker( {
                // showButtonPanel: true,                
                dateFormat: 'mm-dd-yy',
                firstDay: 1,
                changeMonth: false,
                changeYear: false,
                stepMonths: 0,
                defaultDate: new Date( month ), // ( 2014, 2, 1 )
                // onSelect: daySelected,
                beforeShowDay: function( date ) {
                    var highlight = eventDates[ date ];
                    if ( highlight ) {
                        if ( highlight.type == 'working' ) {
                            return [ true, "showWorking", highlight ];
                        } else if ( highlight.type == 'holidays' ) {
                            return [ true, 'showHolidays', highlight ];
                        } else if ( highlight.type == 'friday' ) {
                            return [ true, 'showFriday', highlight ];
                        } else if ( highlight.type == 'intensive' ) {
                            return [ true, 'showIntensive', highlight ];
                        } else if ( highlight.type == 'special' ) {
                            return [ true, 'showSpecial', highlight ];
                        } else if ( highlight.type == 'non_working' ) {
                            return [ true, 'showNon_working', highlight ];
                        }
                    } else {
                        return [ true, 'showDefault', highlight ];
                    }
                 } // beforeShowDay
            });
        }

        $scope.yearChanged = function() {
            showCalendars();
        };

        function createCalendarsHTML() {
            $( '#months div' ).remove();
            for ( var i = 1; i < 13; i++ ) {
                $( '<div/>', {
                    id: 'calendar-' + i,
                    class: 'calendar'
                }).appendTo( '#months' );
            }
            // $( '<p/>', {} ).appendTo( '#months div' );
        }

        function getMonthArrayByYear( year ) {
            var monthArray = [];
            for ( var i = 1; i < 13; i++ ) {
                monthArray.push( i + '/01/' + year );
            }
            return monthArray;
        }

        function resetCellsTitles() {
            $timeout( function () {
                $( '.ui-datepicker td > *' ).each( function ( idx, elem ) {
                    $( this ).attr( 'title', 'Zemsania' );
                });
            }, 100 );
        }
//***************************************************************************************
//***************************************************************************************
//***************************************************************************************

        // var aa = [10,20,30].map(function(elem) {
        //     return elem * 33;
        // });
        // console.log(aa);

        // var bb = [1,2,3].some(function(item) {
        //     return item > 2;
        // });
        // console.log(bb);

        // var cc = [1,2,3].reduce( function( pre, curr, index, array) {
        //     console.log('***********')
        //     console.log(pre);
        //     console.log(curr);
        //     console.log(index);
        //     console.log(array);
        //     return pre + curr;
        // }, 2);
        // console.log(cc);

        // $.map(array, function(item, index) {
        //     return something;
        // });

        // $( [1,2,3] ).each(function(index, el) {
        //     console.log(el);            
        // });
        // console.log('*************');
        // [1,2,3].forEach( function(element, index) {
        //     console.log(element);
        // });
}

})();
