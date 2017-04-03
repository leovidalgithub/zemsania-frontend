
obj.forEach( function( ele ) {
    console.log( ele.date + ' ' + ele.project + ' ' + ele. type + ' ' + ele.subType + ' ' + ele.value + ' ' + ele.status );
});


function getWeeksInMonth( month, year ){
    var weeks = [],
        firstDate = new Date( year, month, 1 ),
        lastDate  = new Date( year, month + 1, 0 ),
        numDays= lastDate.getDate(),
        start = 1,
        end = 8 - firstDate.getDay(),
        months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
   // console.log( months[ firstDate.getMonth() ] + ' ' + firstDate.getFullYear() );
   while( start <= numDays ){
       weeks.push( { start : start, end : end } );
       start = end + 1;
       end = end + 7;
       if( end > numDays ) end = numDays;
   }
    return weeks;
}

var weeks = [];
weeks = getWeeksInMonth( 2, 2017 );
weeks.forEach( function( week, index ) {
    // console.log( '_________________________' );
    // console.log( 'Week #-' + ( index + 1 ) );
    // console.log( 'Start -> ' + week.start );
    // console.log( 'Ends  -> ' + week.end );
});

// *******************************************************************************
Date.prototype.getMonthWeek = function() {
    var firstDay = new Date( this.getFullYear(), this.getMonth(), 1 ).getDay();
    return Math.ceil( ( this.getDate() + firstDay ) / 7 );
}
var dd = new Date();
// console.log( dd.getMonthWeek() );
// *******************************************************************************
// *******************************************************************************


