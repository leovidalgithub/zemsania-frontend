;( function() {
    'use strict';
    angular
        .module( 'hours.approvalHours' )
        .factory( 'projectInfoFactory', projectInfoFactory )

    projectInfoFactory.$invoke = [ 'imputeHoursFactory' ];
    function projectInfoFactory( imputeHoursFactory ) {

        const IMPUTETYPES = imputeHoursFactory.getImputeTypesIndexConst();

        return {

            // it returns the 'projectInfo' object with total of hours and journeys for each project
            // and global total as summary too
            getProjectsInfo: function( ts, calendar, userProjects ) {

                var projectsInfo = {};
                var millisecondsByDayType;
                if( !millisecondsByDayType ) millisecondsByDayType = calendar.eventHours[0].totalPerType;

                for( var projectId in ts ) {
                    var projectName = '';
                    var THI = 0; // Total Horas Imputadas
                    var THT = 0; // Total Horas Trabajadas
                    var TJT = 0; // Total Jornadas Trabajadas
                    var TJA = 0; // Total Jornadas Ausencias
                    var TJV = 0; // Total Jornadas Vacaciones
                    var TJG = 0; // Total Jornadas Guradias

                    if( !projectsInfo[ projectId ] ) projectsInfo[ projectId ] = {}; // creates projectId object
                    for( var day in ts[ projectId ] ) { // throughout by each day of project
                        for( var imputeType in ts[ projectId ][ day ] ) { // throughout by each imputeType of day
                            for( var imputeSubType in ts[ projectId ][ day ][ imputeType ] ) { // throughout by each imputeSubType of imputeType
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
                    projectsInfo[ projectId ].projectId   = projectId;
                    projectsInfo[ projectId ].projectName = projectName;
                    projectsInfo[ projectId ].THI = THI;
                    projectsInfo[ projectId ].THT = THT;
                    projectsInfo[ projectId ].TJT = TJT;
                    projectsInfo[ projectId ].TJA = TJA;
                    projectsInfo[ projectId ].TJG = TJG;
                    projectsInfo[ projectId ].TJV = TJV;
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
                    // calculating dailyWork
                    return calculateDailyWork( dayTypeMilliseconds, imputeType, imputeValue  );
                }

                function getProjectName( projectId ) {
                    if( !userProjects ) return '';
                    return userProjects.find( function( project ) {
                        return project._id == projectId;
                    }).nameToShow;
                }

                var summary = getThisSummary( projectsInfo );
                summary.TJTGlobal = Number( summary.TJTGlobal.toFixed( 1 ) );
                summary.TJAGlobal = Number( summary.TJAGlobal.toFixed( 1 ) );

                return {
                    summary  : summary,
                    projects : projectsInfo
                };
            }
        }

        // RETURNS SUMMARY INFO. GLOBAL TOTAL OF IMPUTED AND JOURNEYS
        function getThisSummary( projectsInfoObj ) {
            var THIGlobal = 0;
            var THTGlobal = 0;
            var TJTGlobal = 0;
            var TJAGlobal = 0;
            var TJVGlobal = 0;
            var TJGGlobal = 0;
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
