var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ngAnimate']);

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
    