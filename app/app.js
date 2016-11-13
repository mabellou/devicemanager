var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ngAnimate']);

app.constant('DEVSTATUS', { 'AVAILABLE' : 'available', 'LOCKED' : 'locked', 'INUSE' : 'inuse' });
app.constant('DEVTYPE', { 'SMARTPHONE' : 'smartphone', 'TABLET' : 'tablet' });
app.constant('USRPROFILE', {'ADMINISTRATOR' : 'administrator', 'TESTER' : 'tester' });

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/', {
      title: 'Devices',
      templateUrl: 'partials/devices.html',
      controller: 'devicesCtrl'
    })
    .when('/userview', {
      title: 'Users',
      templateUrl: 'partials/users.html',
      controller: 'usersCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });;
}]);
    