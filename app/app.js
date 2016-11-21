var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ngAnimate']);

app.constant('DEVSTATUS',   { 'AVAILABLE' : 'available', 'LOCKED' : 'locked', 'INUSE' : 'inuse' });
app.constant('DEVTYPE',     { 'SMARTPHONE' : 'smartphone', 'TABLET' : 'tablet' });
app.constant('USRPROFILE',  { 'ADMINISTRATOR' : 'administrator', 'TESTER' : 'tester' });

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
}]);
    