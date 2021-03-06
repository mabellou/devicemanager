var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ngAnimate', 'toastr', 'angularMoment']);

app.constant('DEVSTATUS', { 'AVAILABLE': 'available', 'LOCKED': 'locked', 'INUSE': 'inuse', 'DELETED': 'deleted' });
app.constant('DEVTYPE', { 'SMARTPHONE': 'smartphone', 'TABLET': 'tablet' });
app.constant('USRPROFILE', { 'ADMINISTRATOR': 'administrator', 'TESTER': 'tester', 'INCUBATOR': 'incubator', 'SAVI': 'savi', 'BUSINESS': 'business' });
app.constant('CONFIG', { 'MAXDEVICES4CURUSR': 3, 'REFRESHINTERVAL': 10000, 'MAXHRSINUSEBYB': 48, 'MAXHRSINUSEBYTIS': 5, 'EODTIMEHHMMSS': '190000' });
app.constant('ENVIRONMENT', { 'DEBUG': false });
app.constant('MESSAGES', { 'SERVICENOK': 'Functionality is not yet supported OR back-end service is unavailable!' });

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
            .when('/devices', {
                title: 'Devices',
                templateUrl: 'partials/devices.html',
                controller: 'devicesCtrl'
            })
            .when('/home', {
                title: 'Devices',
                templateUrl: 'partials/devices.html',
                controller: 'devicesCtrl'
            })
            .when('/users', {
                title: 'Users',
                templateUrl: 'partials/users.html',
                controller: 'usersCtrl'
            })
            .when('/', {
                title: 'Login',
                templateUrl: 'partials/login.html',
                controller: 'loginCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });;
    }
]);
