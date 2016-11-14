
app.controller("menuCtrl", function($scope, $location) {

  $scope.menuClass = function(page) {
    var current = $location.path();
    return page === current ? "blog-nav-item active" : "blog-nav-item";
  };
});