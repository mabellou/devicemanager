app.controller('loginCtrl', function($scope, $modal, $filter, $location, Creds) {

    $scope.loginError = "";
    $scope.loggedUser = "";

    $scope.cancel = function() {
        console.log('loginCtrl.cancel() : NOT SUPPORTED!');
    };

    $scope.login = function(userName, password) {

        sessionStorage.userToken = ''
        sessionStorage.userId = '';
        sessionStorage.userProfile = '';

        // navigate back to the 'login' page ??
        if (!userName || !password) {
            $location.path('/login');
        } else
        if (userName == '' || password == '') {
            $location.path('/login');
        } else {
            Creds.setCredentials(userName, password);

            // navigate to the 'home' page ?
            $location.path('/home');
        }
    };

    $scope.keypress = function(keyEvent, userName, password) {
        if (keyEvent.which === 13) {
            $scope.login(userName, password);
        };
    };
});
