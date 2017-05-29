var API_base = 'http://' + location.hostname + ':5000/';
var API_paths = {
    login: 'authn/login',
    passwordRecovery: 'authn/password/remember',
    createUser: 'authn/signup',

    verifyUniqueUserEmail : 'user/profile/',

    passwordReset: 'user/password',
    getAllUsers: 'user/getAllUsers',
    saveUser: 'user/profile',
    advancedUserSearch: 'user/advancedUserSearch',
    newSearchUser: 'user/newSearch',
    removeUser: 'user/delete',    

    getEmployeesTimesheets: 'approval/getEmployeesTimesheets/',

    getTimesheets: 'timesheets/getTimesheets/',
    setAllTimesheets: 'timesheets/setAllTimesheets/',

    dayGet: 'dailyReport/get',
    dayGetByUser: 'dailyReport/getByUserID',
    dayImpute: 'dailyReport/impute',
    dayValidate: 'dailyReport/validateByUserID',
    dayReject: 'dailyReport/reject',
    daySend: 'dailyReport/send',
    getDailyConcepts: 'dailyReport/getDailyConcepts',

    projectSearch: 'project/search',
    getProjectsByUserId: 'projectUsers/getProjectsByUserId/',
    getUsersByProjectId: 'projectUsers/getUsersByProjectId/',
    demarcateUserProject: 'projectUsers/demarcateUserProject',
    marcateUserProject: 'projectUsers/marcateUserProject',
    countOcurrences:    'projectUsers/countOcurrences',
    // projectGetUsers: 'projectUsers/getUsersByProjectID',
    // projectUserSave: 'projectUsers/save',
    // getUsersBySupervisor: 'projectUsers/getUsersBySupervisor',
    projectUserUpdate: 'projectUsers/update',
    projectUserDelete: 'projectUsers/delete',

    getAllNotifications: 'notifications/allNotifications',
    insertNewNotification: 'notifications/insertNewNotification',
    markReadNotifications: 'notifications/markRead',
    // unreadNotifications: 'notifications/unreads',

    holidays: 'holidays',
    holidaysRequest: 'holidays/request',
    holidaysApprove: 'holidays/approve',
    holidaysReject: 'holidays/reject',

    // getCalendars : 'calendar/getCalendars',
    getCalendarById : 'calendar/getCalendarById/',
    getRefreshCalendarData : 'calendar/getRefreshCalendarData',
    getCalendarsNames : 'calendar/getCalendarNames/',
    advancedCalendarSearch: 'calendar/advancedCalendarSearch',
    // getCalendarByIdByMonth : 'calendar/getCalendarByIdByMonth/',

    getSpents: 'spents/get',
    getSpentById: 'spents/search',
    spentsImpute: 'spents/impute',
    getSpentsTypes: 'spents/types',
    spents: 'spents',
    spentsDelete: 'spents/delete',

    getAbsences: 'absences/get',
    getAbsencesById: 'absences/search',
    absencesImpute: 'absences/impute',
    getAbsencesTypes: 'absences/types',
    absences: 'absences',
    absencesDelete: 'absences/delete',

    getMasterCollection: 'mcollections/',
    getEnterprisesCollection: 'mcollections/enterprises',

    getSupervisors: 'mcollections/supervisorsExceptID/',
    getAllSupervisors: 'mcollections/allSupervisors',

    getDefaultPassword: 'mcollections/defaultPassword',

    filesUpload: 'files/upload',
    filesView: 'files/view',
    filesRemove: 'files/remove'
};

function buildURL( path ) { // ***************** LEO WAS HERE *****************
    'use strict';
    return API_base + API_paths[ path ];
}

function loadPermissions( Permission, UserFactory ) { // Permission -> PermRoleStore
    'use strict';
    Permission.defineRole( 'anonymous', function () {
        return !UserFactory.getUser();
    });

    Permission.defineRole( 'user', function () {
        var isEmployee = false;
        if (angular.isDefined( UserFactory.getUser() ) ) {
            if (UserFactory.getUser().role === 'user') {
                isEmployee = true;
            }
        }
        return isEmployee;
    });

    Permission.defineRole( 'delivery', function () {
        var isEmployee = false;
        if (angular.isDefined( UserFactory.getUser() ) ) {
            if (UserFactory.getUser().role === 'delivery') {
                isEmployee = true;
            }
        }
        return isEmployee;
    });

    Permission.defineRole( 'manager', function () {
        var isEmployee = false;
        if (angular.isDefined( UserFactory.getUser() ) ) {
            if ( UserFactory.getUser().role === 'manager' ) {
                isEmployee = true;
            }
        }
        return isEmployee;
    });

    Permission.defineRole( 'administrator', function () {
        var isEmployee = false;
        if ( angular.isDefined( UserFactory.getUser() ) ) {
            if (UserFactory.getUser().role === 'administrator') {
                isEmployee = true;
            }
        }
        return isEmployee;
    });
}

function tmpData($rootScope) {
    'use strict';
    var tmpDataObject = {};
    $rootScope.tmpData = function (method, key, value) {
        switch (method) {
            case 'add' :
                tmpDataObject[key] = value;
                break;
            case 'remove' :
                delete tmpDataObject[key];
                break;
            case 'get' :
                return tmpDataObject[key];
        }
    };
}

function toGMT0(date) {
    'use strict';
    var now = new Date();
    if (!angular.isDate(date)) {
        date = new Date(date);
    }
    date.setHours(1);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return new Date(date.valueOf() + now.getTimezoneOffset() * 60000);
}

// TO SHOW/HIDE 'toUpButton' BUTTON (NOTIFICATIONS AND EMPLOYEEMANAGER-LIST)
function showUpButton( upButton, currentScroll ) { // if ( scrollWrapper.scrollTop + window.innerHeight >= scrollWrapper.scrollHeight )
            if ( currentScroll >= 400 ) {
                upButton.fadeIn( 'slow' );
            }
                if ( currentScroll < 400 ) {
                upButton.fadeOut( 'slow' );
            }
}

// TO TAKE SECTION SCROLL TO TOP
function takeMeUp() {
    $( '#page-content-wrapper #section' ).animate( { scrollTop: 0 }, 'slow' );
}

// CALCULATES AND RETURNS NUMBER OF ITEMS PER PAGE FOR AT-TABLE ON NOTIFICATIONS, EMPLOYEEMANAGER-LIST AND CALENDARS-LIST
function getItemsPerPage( value ) {
    return Math.floor( window.innerHeight / value ).toString();
};

// CALCULATES DAILYWORK ACCORDING TO IMPUTETYPE (HORAS, GUARDIAS, ETC.), IMPUTED VALUE AND DAYTYPEMILLISECONDS
function calculateDailyWork( dayTypeMilliseconds, imputeType, imputeValue  ) {
    var dailyWork = 0;
    if( dayTypeMilliseconds != 0 ) { // if no milliseconds (holiday or non-working), no dailyWork is computed
        if( imputeType != 1 && imputeType != 3 ) { // Guardias and Vacaciones not count
            var imputedMilliseconds = ( imputeValue * 3600000 );
            dailyWork = ( imputedMilliseconds / dayTypeMilliseconds );
        }
    }
    return dailyWork;
}

