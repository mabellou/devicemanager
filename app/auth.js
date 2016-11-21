
app.factory('Creds', function () {

    /* !! credentials acts as DTO 4 the VT back-end .. all properties should be kept in lowercase !! */
    var credentials = { username : '', password : '' };

    return {
        setCredentials: function(userName, password) {
            credentials.username = userName;
            credentials.password = password;
        },
        getCredentials: function() {
            return credentials;
        },
    };
});

/*
app.factory("Auth", ['$http', 'Data',
    function ($http, Data) {

        var obj = {};

        obj.authenticate = function(credentials) {
            var currentuser = {};
            
            Data.post('authenticate', credentials).then(function(data) {
                    sessionStorage.userToken = data.token;
                    sessionStorage.userId = data.userid;
            });
            // quid error(s) returned ?

            // get the user info of the 'current user' .. 
            if (sessionStorage.userToken) {
                // call the (VT) Service to fetch the 'current user' info ..
                Data.get('user/' + sessionStorage.userId + '?token=' + sessionStorage.userToken).then(function(data) {
                    // capture the user data into a $scope.currentuser object .. 
                    currentuser = { userid : data.id, fullname : data.fullname, profile : data.profile };
                });
                // quid error(s) returned ?
            }

            return currentuser;
        };



        return obj;
}]);
*/
