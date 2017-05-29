;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .factory( 'projectInfoFactory', projectInfoFactory )

    projectInfoFactory.$invoke = [ ];
    function projectInfoFactory( ) {

        return {

            getProjectsInfo2: function( ts, IMPUTETYPES, calendar, _userProjects ) {

                var projectsInfoTemp = {};
                var millisecondsByDayType;
                var userProjects = _userProjects;
                if( !millisecondsByDayType ) millisecondsByDayType = calendar.eventHours[0].totalPerType;

                // getting total of hours, guards and holidays
                for( var projectId in ts ) {
                    var projectName = '';
                    var THI = 0;
                    var THT = 0;
                    var TJT = 0;
                    var TJA = 0;
                    var TJV = 0;
                    var TJG = 0;

                    if( !projectsInfoTemp[ projectId ] ) projectsInfoTemp[ projectId ] = {}; // creates projectId object
                    for( var day in ts[ projectId ] ) { // throughting by each day of project
                        for( var imputeType in ts[ projectId ][ day ] ) { // throughting by each imputeType of day
                            for( var imputeSubType in ts[ projectId ][ day ][ imputeType ] ) { // throughting by each imputeSubType of imputeType
                                var imputeValue = ts[ projectId ][ day ][ imputeType ][ imputeSubType ].value; // getting value
                                if( imputeType == IMPUTETYPES.Horas || imputeType == IMPUTETYPES.Variables || imputeType == IMPUTETYPES.Ausencias ) {
                                    THI += imputeValue;
                                    if( imputeType == IMPUTETYPES.Ausencias ) {
                                        TJA += dailyWorkCalculate( calendar, day, imputeType, imputeValue );
                                    } else {
                                        THT += imputeValue;
                                        TJT += dailyWorkCalculate( calendar, day, imputeType, imputeValue );                                    
                                    }
                                } else if ( imputeType == IMPUTETYPES.Guardias ) {
                                        TJG += imputeValue;
                                } else if ( imputeType == IMPUTETYPES.Vacaciones ) {
                                        TJV += imputeValue;
                                }
                            }
                        }
                    }

                    projectName = getProjectName( projectId ); // getting project name
                    TJT = Number( TJT.toFixed( 1 ) ); // round to one decimal
                    TJA = Number( TJA.toFixed( 1 ) ); // round to one decimal
                    projectsInfoTemp[ projectId ].projectId   = projectId;
                    projectsInfoTemp[ projectId ].projectName = projectName;
                    projectsInfoTemp[ projectId ].THI = THI;
                    projectsInfoTemp[ projectId ].THT = THT;
                    projectsInfoTemp[ projectId ].TJT = TJT;
                    projectsInfoTemp[ projectId ].TJA = TJA;
                    projectsInfoTemp[ projectId ].TJG = TJG;
                    projectsInfoTemp[ projectId ].TJV = TJV;
                }

                // calculates dailyWork according to dayType milliseconds and imputed-hours
                function dailyWorkCalculate( calendar, day, imputeType, imputeValue ) {
                    var dayType = '';
                    var dayTypeMilliseconds = 0;
                    // getting dayType acoording to day            
                    if( calendar.eventHours[0].eventDates[ day ] ) {
                        dayType = calendar.eventHours[0].eventDates[ day ].type;
                    }
                    // getting dayType milliseconds
                    if( millisecondsByDayType[ dayType ] ) dayTypeMilliseconds = millisecondsByDayType[ dayType ].milliseconds;
                    // // calculating dailyWork
                    return calculateDailyWork( dayTypeMilliseconds, imputeType, imputeValue  );
                }

                function getProjectName( projectId ) {
                    return userProjects.find( function( project ) {
                        return project._id == projectId;
                    }).nameToShow;
                }

                var summary = getThisSummary( projectsInfoTemp );
                projectsInfoTemp.summary = summary;
                return projectsInfoTemp;
            }
        }

        // RETURNS SUMMARY INFO. GLOBAL TOTAL OF IMPUTED AND DAILYWORK
        function getThisSummary( projectsInfoObj ) {
            var THIGlobal  = 0;
            var THTGlobal  = 0;
            var TJTGlobal  = 0;
            var TJAGlobal  = 0;
            var TJVGlobal  = 0;
            var TJGGlobal  = 0;
            for( var project in projectsInfoObj ) {
                THIGlobal += projectsInfoObj[ project ].THI;
                THTGlobal += projectsInfoObj[ project ].THT;
                TJTGlobal += projectsInfoObj[ project ].TJT;
                TJAGlobal += projectsInfoObj[ project ].TJA;
                TJVGlobal += projectsInfoObj[ project ].TJV;
                TJGGlobal += projectsInfoObj[ project ].TJG;
            }
            return {
                THIGlobal : THIGlobal,
                THTGlobal : THTGlobal,
                TJTGlobal : TJTGlobal,
                TJAGlobal : TJAGlobal,
                TJVGlobal : TJVGlobal,
                TJGGlobal : TJGGlobal
            };
        }
    }

}());
