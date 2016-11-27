
app.controller("menuCtrl", function($scope, $location, Creds) {

  $scope.menuClass = function(page) {
    var current = $location.path();
    return page === current ? "blog-nav-item active" : "blog-nav-item";
  };

  $scope.userName = function() {
    return Creds.getCredentials().username;
  };
});