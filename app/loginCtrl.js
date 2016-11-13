app.controller('loginCtrl', function ($scope, $modal, $filter, Data, $location) {

  $scope.loginError = "";
  $scope.loggedUser = "";

  $scope.cancel = function() {
    console.log('>>cancel');
  };

  $scope.login = function(u, p) {
    console.log('>>login ' + u + '/' + p);

  };
  
});