var API_base = 'http://' + location.hostname + ':3000/';
var API_paths = {
    login: 'authn/login',
    passwordRecovery: 'authn/password/remember',
    createUser: 'authn/signup',

    verifyUniqueUserEmail : 'user/profile/',

    passwordReset: 'user/password',
    getAllUsers: 'user/all',
    saveUser: 'user/profile',
    searchUser: 'user/search',
    newSearchUser: 'user/newSearch',
    removeUser: 'user/delete',

    dayGet: 'dailyReport/get',
    dayGetByUser: 'dailyReport/getByUserID',
    dayImpute: 'dailyReport/impute',
    dayValidate: 'dailyReport/validateByUserID',
    dayReject: 'dailyReport/reject',
    daySend: 'dailyReport/send',
    getDailyConcepts: 'dailyReport/getDailyConcepts',

    projectSearch: 'project/search',
    projectGetUsers: 'projectUsers/getUsersByProjectID',
    projectUserSave: 'projectUsers/save',
    // getUsersBySupervisor: 'projectUsers/getUsersBySupervisor',
    projectUserUpdate: 'projectUsers/update',
    projectUserDelete: 'projectUsers/delete',

    unreadNotifications: 'notifications/unreads',
    markReadNotifications: 'notifications/markRead',

    holidays: 'holidays',
    holidaysRequest: 'holidays/request',
    holidaysApprove: 'holidays/approve',
    holidaysReject: 'holidays/reject',

    getCalendars : 'calendar/getCalendars',
    getCalendarById : 'calendar/getCalendarById/',

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

function loadPermissions(Permission, UserFactory) { // Permission -> PermRoleStore
    'use strict';
    Permission.defineRole('anonymous', function () {
        return !UserFactory.getUser();
    });

    Permission.defineRole('employee', function () {
        var isEmployee = false;
        if (angular.isDefined(UserFactory.getUser())) {
            if (UserFactory.getUser().role === 'employee') {
                isEmployee = true;
            }
        }
        return isEmployee;
    });

    Permission.defineRole('manager', function () {
        var isEmployee = false;
        if (angular.isDefined(UserFactory.getUser())) {
            if (UserFactory.getUser().role === 'manager') {
                isEmployee = true;
            }
        }
        return isEmployee;
    });

    Permission.defineRole('administrator', function () {
        var isEmployee = false;
        if (angular.isDefined(UserFactory.getUser())) {
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