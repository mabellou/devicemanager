app.controller('usersCtrl', function($scope, $modal, $filter, $location, Data, Creds, USRPROFILE, CONFIG, toastr) {

    $scope.currentuser = {};
    $scope.users = [];

    $scope.fetchUsers = function(notifyUser) {
        Data.get('users?token=' + sessionStorage.userToken).then(function(data) { 
            $scope.users = data;

            if (notifyUser)
                toastr.success('Users loaded successfully!');
        });
    };

    $scope.create = function (p,size) {
        var modalInstance = $modal.open({
          templateUrl: 'partials/usersEdit.html',
          controller: 'userCreateCtrl',
          size: size,
          resolve: {
            item: function () {
              return p;
            }
          }
        });
        modalInstance.result.then(function(selectedObject) {
                delete selectedObject.save;
                delete selectedObject.id;
                $scope.users.push(selectedObject);
                $scope.users = $filter('orderBy')($scope.users, 'badgeid', 'reserve');
        });
    };

    /* authenticate the 'current user' ?! .. */
    if (!sessionStorage.userToken || sessionStorage.userToken == '') {
        /* var credentials = { username : 'marcvermeir', password : 'azerty' }; */
        var credentials = Creds.getCredentials();
        if (credentials.username == '' || credentials.password == '') {
            $location.path('/login');
        }

        Data.post('authenticate', credentials).then(function(data) {
            sessionStorage.userToken = data.token;
            sessionStorage.userId = data.userid;

            /* get the user info of the 'current user' .. */
            if (!sessionStorage.userToken || sessionStorage.userToken == '') {
                $location.path('/login');
            } else {
                /* call the (VT) Service to fetch the 'current user' info .. */
                Data.get('user/' + sessionStorage.userId + '?token=' + sessionStorage.userToken).then(function(data) {
                    /* capture the user data into a $scope.currentuser object .. */
                    $scope.currentuser = { userid: data.id, fullname: data.fullname, profile: data.profile };
                    sessionStorage.userProfile = $scope.currentuser.profile;

                    toastr.success('User ' + credentials.username + ' authenticated successfully!');

                    // only Administrators can see the list of users .. 
                    if ($scope.currentuser.profile == USRPROFILE.ADMINISTRATOR) {
                        /* call the (VT) Service to fetch the list of users .. */
                        //Data.get('users?token=' + sessionStorage.userToken).then(function(data) {
                        //    $scope.users = data;
                        //});
                        $scope.fetchUsers(true);
                        // quid error(s) returned ? 
                    }
                });
                // quid error(s) returned ?
            }
        });
        // quid error(s) returned ?
    } else {
        $scope.currentuser = { profile: sessionStorage.userProfile };

        // only Administrators can see the list of users .. 
        if ($scope.currentuser.profile == USRPROFILE.ADMINISTRATOR) {
            //Data.get('users?token=' + sessionStorage.userToken).then(function(data) {
            //    $scope.users = data;
            //});
            $scope.fetchUsers(true);
            // quid error(s) returned ?
        }
    }

    $scope.columns = [{ text: "Badge ID", predicate: "badgeid", sortable: true, dataType: "number" },
        { text: "Name", predicate: "fullname", sortable: true },
        { text: "Profile", predicate: "profile", sortable: true },
        { text: "Active Until", predicate: "enddate", sortable: true },
        { text: "#Devices Locked", predicate: "counterlocked", sortable: true, dataType: "number" },
        { text: "#Devices In Use", predicate: "counterinuse", sortable: true, dataType: "number" },
        { text: "Action", predicate: "", sortable: false }
    ];

    /* ???
    $scope.isAdministrator = function() {
        return ($scope.currentuser.profile == USRPROFILE.ADMINISTRATOR)
    };
    */

    /* NOT YET SUPPORTED

    $scope.deleteUser = function(user) {
        // todo: delete user should be a logical delete where the enddate will be set equal to today
        if(confirm("Are you sure to remove the user")){
            Data.delete("users/"+user.badgeid).then(function(result){
                $scope.users = _.without($scope.users, _.findWhere($scope.users, {badgeid:user.badgeid}));
            });
        }
    };

    $scope.open = function (p,size) {
        var modalInstance = $modal.open({
          templateUrl: 'partials/usersEdit.html',
          controller: 'userEditCtrl',
          size: size,
          resolve: {
            item: function () {
              return p;
            }
          }
        });
        modalInstance.result.then(function(selectedObject) {
                p.badgeid = selectedObject.badgeid;
                p.name = selectedObject.name;
                p.lastlogged = selectedObject.lastlogged;
        });
    };

    
    $scope.getClass = function(date) {
        return 'info';
        // todo: class value should be 'danger' if date (dd/mm/yyyy) < currentdate, otherwise return 'info'
        // return {'info': date - today <= 0, 'danger': (date - today > 0 && date - today <= 3)};
    };
    */
});

app.controller('userCreateCtrl', function ($scope, $modalInstance, item, Data) {

    $scope.user = angular.copy(item);
        
    $scope.cancel = function () {
        $modalInstance.dismiss('Close');
    };

    $scope.title = 'Add User';
    $scope.buttonText = 'Add New User';

    var original = item;
    $scope.isClean = function() {
        return angular.equals(original, $scope.user);
    }

    $scope.saveUser = function (user) {
        Data.post('users', user).then(function (result) {
                    if(result.status != 'error'){
                        var x = angular.copy(user);
                        x.save = 'insert';
                        x.id = result.data;
                        $modalInstance.close(x);
                    }else{
                        console.log(result);
                    }
                });
        };
});


/* NOT YET SUPPORTED
app.controller('userEditCtrl', function ($scope, $modalInstance, item, Data) {

  $scope.user = angular.copy(item);
        
        $scope.cancel = function () {
            $modalInstance.dismiss('Close');
        };
        $scope.title = 'Edit User' ;
        $scope.buttonText = 'Update User';

        var original = item;
        $scope.isClean = function() {
            return angular.equals(original, $scope.user);
        }
        $scope.saveUser = function (user) {
                Data.put('users/'+user.badgeid, user).then(function (result) {
                    if(result.status != 'error'){
                        var x = angular.copy(user);
                        x.save = 'update';
                        $modalInstance.close(x);
                    }else{
                        console.log(result);
                    }
                });
        };
});


*/
