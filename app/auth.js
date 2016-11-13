/* OBSOLETE ?! */

app.factory("Auth", ['$http', 'Data',
    function ($http, Data) {

        var obj = {};

        obj.authenticate = function(credentials) {
            var currentuser = {};
            
            /* authenticate the 'current user' .. */ 
            Data.post('authenticate', credentials).then(function(data) {
                    sessionStorage.userToken = data.token;
                    sessionStorage.userId = data.userid;
            });
            /* quid error(s) returned ? */

            /* get the user info of the 'current user' .. */
            if (sessionStorage.userToken) {
                /* call the (VT) Service to fetch the 'current user' info .. */
                Data.get('user/' + sessionStorage.userId + '?token=' + sessionStorage.userToken).then(function(data) {
                    /* capture the user data into a $scope.currentuser object .. */
                    currentuser = { userid : data.id, fullname : data.fullname, profile : data.profile };
                });
                /* quid error(s) returned ? */
            }

            return currentuser;
        };

        return obj;
}]);
