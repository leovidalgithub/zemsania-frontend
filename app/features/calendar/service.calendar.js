( function () {
    'use strict';
    angular
        .module( 'hours.calendar' )
        .factory( 'CalendarFactory', CalendarFactory );

    CalendarFactory.$invoke = [ '$http', '$q' ];
    function CalendarFactory( $http, $q ) {
        return {

            getCalendarById: function ( calendarID, year, month ) { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getCalendarById' ) + calendarID + '?year=' + year + '&month=' + month )
                    .then( function ( response ) {
                        dfd.resolve( response.data );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            getCalendarsNames: function() { // LEO WAS HERE
                var dfd = $q.defer();
                $http.get( buildURL( 'getCalendarsNames' ) )
                    .then( function ( data ) {
                        dfd.resolve( data.data.calendars );
                    })
                    .catch( function ( err ) {
                        dfd.reject( err );
                    });
                return dfd.promise;
            },

            // getCalendars: function () { // LEO WAS HERE
            //     var dfd = $q.defer();
            //     $http.get( buildURL( 'getCalendars' ) )
            //         .then( function ( response ) {
            //             dfd.resolve( response.data.calendars );
            //         })
            //         .catch( function ( err ) {
            //             dfd.reject( err );
            //         });
            //     return dfd.promise;
            // },

            // getCalendarByIdByMonth: function ( calendarID, month, year ) { // LEO WAS HERE
            //     var dfd = $q.defer();
            //     $http.get( buildURL( 'getCalendarByIdByMonth' ) + calendarID + '?month=' + month + '&year=' + year )
            //         .then( function ( response ) {
            //             dfd.resolve( response.data );
            //         })
            //         .catch( function ( err ) {
            //             dfd.reject( err );
            //         });
            //     return dfd.promise;
            // },

            // getCalendarByDates: function (initDate, endDate, user) {
            //     var dfd = $q.defer();
            //     var dates = {
            //         initDate: initDate,
            //         endDate: endDate
            //     };
            //     /* global t_dates*/
            //     window.t_dates = dates;
            //     var serviceUrl = buildURL('dayGet');
            //     if (user) {
            //         dates.userId = user;
            //         serviceUrl = buildURL('dayGetByUser');
            //     }

            //     $http
            //         .post(serviceUrl, dates)
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 var projects = response.data.projects;
            //                 var dailyReports = response.data.dailyReports;
            //                 var datesBlocked = response.data.datesBlocked;
            //                 var todayDate = toGMT0(t_dates.initDate);
            //                 var _end = toGMT0(angular.copy(todayDate));
            //                 var weekEnd = toGMT0(new Date(_end.setDate(_end.getDate() + 6)));
            //                 //

            //                 var blockDates = [];
            //                 var serviceResponse = {};
            //                 var customers_matrix = [];
            //                 var customers = {};
            //                 var userProjects = [];
            //                 var workingDays = {};
            //                 //

            //                 datesBlocked.forEach(function (date) {
            //                     blockDates.push(toGMT0(date).getDay());
            //                 });

            //                 projects.forEach(function (project) {
            //                     var newProject = !$filter('filter')(userProjects, {projectRef: project.projectRef}, true).length;

            //                     if (newProject && angular.isUndefined(workingDays[project.projectRef])) {
            //                         workingDays[project.projectRef] = [];
            //                     }

            //                     var projectInit = toGMT0(project.implicationInit);
            //                     var projectEnd;
            //                     if (angular.isDefined(project.implicationEnd)) {
            //                         projectEnd = toGMT0(project.implicationEnd);
            //                     } else {
            //                         var inALongTime = new Date().setFullYear(6000);
            //                         projectEnd = toGMT0(inALongTime);
            //                     }

            //                     if (projectInit < todayDate) {
            //                         projectInit = angular.copy(todayDate);
            //                     }

            //                     if (projectEnd > weekEnd) {
            //                         projectEnd = weekEnd;
            //                     }

            //                     while (projectInit <= projectEnd) {
            //                         var add = new Date(toGMT0(projectInit)).getDay();
            //                         if (workingDays[project.projectRef].indexOf(add) < 0 &&
            //                             blockDates.indexOf(add) < 0) {

            //                             workingDays[project.projectRef].push(add);
            //                         }
            //                         projectInit = toGMT0(new Date(projectInit.setDate(projectInit.getDate() + 1)));
            //                     }

            //                     if (newProject) {
            //                         project.days = workingDays[project.projectRef];
            //                         project.reports = {};

            //                         project.days.forEach(function (day) {
            //                             var t_day = day - 1;
            //                             t_day = t_day < 0 ? 6 : t_day;
            //                             var t_initDate = new Date(t_dates.initDate);
            //                             var t_date = toGMT0(new Date(t_initDate.setDate(t_initDate.getDate() + t_day)));
            //                             var reportAssociated = $filter('filter')(dailyReports, {
            //                                 projectId: project._id,
            //                                 date: $filter('date')(t_date, 'yyyy-MM-dd')
            //                             });

            //                             project.subfamilies.forEach(function (family) {
            //                                 project.reports[day + '_' + family] = {
            //                                     date: t_date,
            //                                     conceptDailyId: family,
            //                                     projectId: project._id
            //                                 };
            //                             });

            //                             if (reportAssociated.length) {
            //                                 reportAssociated.forEach(function(repo){
            //                                     project.reports[day+ '_' + repo.conceptDailyId].units = repo.units;
            //                                     project.reports[day+ '_' + repo.conceptDailyId].report = repo.report;
            //                                     project.status = reportAssociated[0].status;
            //                                 });

            //                             }
            //                         });
            //                         userProjects.push(project);

            //                         if (angular.isUndefined(customers[project.customerName])) {
            //                             customers[project.customerName] = [];
            //                         }
            //                         customers[project.customerName].push(project);
            //                     }
            //                 });

            //                 Object.keys(customers).forEach(function (customer) {
            //                     var t_customer = {
            //                         customerName: customer,
            //                         projects: customers[customer]
            //                     };
            //                     customers_matrix.push(t_customer);
            //                 });

            //                 serviceResponse.customers = customers_matrix;
            //                 serviceResponse.projects = projects;

            //                 dfd.resolve(serviceResponse);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // saveImputedHours: function (days) {
            //     var dfd = $q.defer();
            //     $http
            //         .post(buildURL('dayImpute'), {"dailyReports": days})
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(response.data);
            //             } else {
            //                 dfd.reject(response.data.errors);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // getDailyConcepts: function () {
            //     var dfd = $q.defer();
            //     $http
            //         .get(buildURL('getDailyConcepts'))
            //         .then(function (response) {
            //             if (response.data) {
            //                 dfd.resolve(response.data);
            //             } else {
            //                 dfd.reject(response.data);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // getUserHolidayCalendar: function (user) {
            //     var dfd = $q.defer();
            //     var specificUser = '';

            //     if (angular.isDefined(user)) {
            //         specificUser = '/' + user;
            //     }

            //     $http
            //         .get(buildURL('holidays') + specificUser)
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 var holidays = response.data.holidays;
            //                 var holidaysEvents = [];

            //                 holidays.forEach(function (entry) {
            //                     var status;
            //                     var statusIcon;
            //                     switch (entry.status) {
            //                         case 'requested':
            //                             statusIcon = 'fa-clock-o';
            //                             status = '';
            //                             break;
            //                         case 'approved':
            //                             statusIcon = 'fa-check';
            //                             status = '';
            //                             break;
            //                         case 'rejected':
            //                             statusIcon = 'fa-times';
            //                             status = '';
            //                             break;
            //                     }

            //                     holidaysEvents.push({
            //                         id: entry._id,
            //                         title: status,
            //                         status: entry.status,
            //                         icon: statusIcon,
            //                         start: new Date(entry.date),
            //                         end: new Date(entry.date),
            //                         className: 'event_' + entry.status
            //                     });
            //                 });

            //                 dfd.resolve(holidaysEvents);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // requestHoliday: function (event) {
            //     var dfd = $q.defer();

            //     $http
            //         .post(buildURL('holidaysRequest'), {days: [event.start]})
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 event.id = 'new';
            //                 event.end = event.start;
            //                 event.title = '';
            //                 event.status = 'requested';
            //                 event.className = 'event_requested';
            //                 dfd.resolve(event);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // removeHoliday: function (event) {
            //     var dfd = $q.defer();

            //     $http
            //         .delete(buildURL('holidays') + '/' + event.id)
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(event);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // updateHolidayStatus: function (type, event) {
            //     var dfd = $q.defer();

            //     $http
            //         .put(buildURL('holidays') + '/' + type, {holidays: [event.id]})
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(event);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // moderateImputedHours: function (dateLapse, userId, reject) {
            //     var dfd = $q.defer();
            //     var dateInterval = {
            //         initDate: new Date(dateLapse[0]).toGMTString(),
            //         endDate: new Date(dateLapse[1]).toGMTString(),
            //         userId: userId
            //     };

            //     var destUrl = buildURL('dayValidate');
            //     if (angular.isDefined(reject)) {
            //         destUrl = buildURL('dayReject');
            //     }

            //     $http
            //         .post(destUrl, dateInterval)
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(response.data);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // },
            // sendImputedHours: function (dateLapse) {
            //     var dfd = $q.defer();
            //     var dateInterval = {
            //         initDate: new Date(dateLapse[0]).toGMTString(),
            //         endDate: new Date(dateLapse[1]).toGMTString()
            //     };

            //     $http
            //         .post(buildURL('daySend'), dateInterval)
            //         .then(function (response) {
            //             if (response.data.success) {
            //                 dfd.resolve(response.data);
            //             } else {
            //                 dfd.reject(response);
            //             }
            //         }, function (err) {
            //             dfd.reject(err);
            //         });

            //     return dfd.promise;
            // }

        };
    }
}());