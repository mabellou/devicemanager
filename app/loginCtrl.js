app.controller('loginCtrl', function ($scope, $modal, $filter, $location, Creds) {

  $scope.loginError = "";
  $scope.loggedUser = "";

  $scope.cancel = function() {
    console.log('loginCtrl.cancel() : NOT SUPPORTED!');
  };

  $scope.login = function(userName, password) {

    sessionStorage.userToken = '';
    sessionStorage.userId = '';

    Creds.setCredentials(userName, password)
    /* navigate to the 'home' page .. */
    $location.path('/home');
  };
});