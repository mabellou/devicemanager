app.controller('usersCtrl', function($scope, $modal, $filter, $location, $interval, Data, Creds, USRPROFILE, CONFIG, ENVIRONMENT, toastr) {

    $scope.currentuser = {};
    $scope.users = [];
    $scope.user = {};

    $interval(function() { $scope.callAtInterval(); }, CONFIG.REFRESHINTERVAL);

    $scope.callAtInterval = function() {
        $scope.fetchUsers();
    };

    $scope.isAdministrator = function() {
        return ENVIRONMENT.DEBUG || $scope.currentuser.profile == USRPROFILE.ADMINISTRATOR;
    };

    //todo: getErrorMsg() should become a common function, reuseable in multiple controlleers ..
    $scope.getErrorMsg = function(dataError) {
        if (dataError) {
            return (ENVIRONMENT.DEBUG ? '   [' + dataError.text + ']' : '');
        }
    };

    $scope.fetchUsers = function(notifyUser) {
        Data.get('users?token=' + sessionStorage.userToken).then(function(data) {
            if (!data.error) {
                $scope.users = data;
                if (notifyUser)
                    toastr.success('Users were loaded successfully!');
            } else
            if (notifyUser)
                toastr.warning('Technical problem with fetching users!' + $scope.getErrorMsg(data.error));
        });
    };

    $scope.deleteUser = function(user) {

        // !! deleting user is a logical delete where the enddate will be set equal to today
        var user2delete = angular.copy(user);

        if (confirm('Are you sure to remove the user ' + user2delete.firstname + ' ' + user2delete.lastname + ' ?')) {
            var today = new Date();
            user2delete.enddate = today.toISOString();

            Data.put('user/' + user2delete.id + '?token=' + sessionStorage.userToken, user2delete).then(function(result) {
                //TODO: complete the following .. check the result / errorcode ?
                if (false) { // || result.error) {
                    toastr.warning('Technical problem with "deleting" the user ' + user2delete.username + $scope.getErrorMsg(result.error));
                } else {
                    //TODO: ... yyyy-MM-dd >> dd/MM/yyyy
                    var ed = user2delete.enddate;
                    user.enddate = ed.substr(8, 2) + '/' + ed.substr(5, 2) + '/' + ed.substr(0, 4); 

                };
            });
        };
    };

    $scope.create = function(p, size) {
        var modalInstance = $modal.open({
            templateUrl: 'partials/usersEdit.html',
            controller: 'userCreateCtrl',
            size: size,
            resolve: {
                item: function() {
                    return p;
                }
            }
        });
        modalInstance.result.then(function(selectedObject) {
            if (selectedObject) {
                delete selectedObject.save;
                $scope.users.push(selectedObject);
                $scope.users = $filter('orderBy')($scope.users, 'badgeid', 'reverse');
            }
        });
    };

    $scope.open = function(p, size) {
        var modalInstance = $modal.open({
            templateUrl: 'partials/usersEdit.html',
            controller: 'userEditCtrl',
            size: size,
            resolve: {
                item: function() {
                    return p;
                }
            }
        });
        modalInstance.result.then(function(selectedObject) {
            if (selectedObject) {

                //todo: check the following ?! :
                p.badgeid = selectedObject.badgeid;
                p.username = selectedObject.username;
                p.firstname = selectedObject.firstname;
                p.lastname = selectedObject.lastname;
                p.profile = selectedObject.profile;
                p.enddate = selectedObject.enddate;
            }
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
            if (!data.error) {
                sessionStorage.userToken = data.token;
                sessionStorage.userId = data.userid;

                /* get the user info of the 'current user' .. */
                if (!sessionStorage.userToken || sessionStorage.userToken == '') {
                    $location.path('/login');
                } else {
                    /* call the (VT) Service to fetch the 'current user' info .. */
                    Data.get('user/' + sessionStorage.userId + '?token=' + sessionStorage.userToken).then(function(data) {
                        if (!data.error) {
                            // capture the user data into a $scope.currentuser object ..
                            $scope.currentuser = { userid: data.id, fullname: data.fullname, profile: data.profile };

                            sessionStorage.userProfile = $scope.currentuser.profile;
                            sessionStorage.fullName = $scope.currentuser.fullname;

                            toastr.success('User ' + credentials.username + ' authenticated successfully!');

                            // only Administrators can see the list of users .. 
                            if (ENVIRONMENT.DEBUG || $scope.currentuser.profile == USRPROFILE.ADMINISTRATOR) {
                                $scope.fetchUsers(true);
                            }
                        } else {
                            toastr.warning('Technical problem with fetching user ' + sessionStorage.userId + $scope.getErrorMsg(data.error));
                            $location.path('/login');
                        }
                    });
                }
            } else {
                toastr.warning('Technical problem with authenticating user ' + credentials.username + $scope.getErrorMsg(data.error));
                $location.path('/login');
            }
        });
    } else {
        $scope.currentuser = { userid: parseInt(sessionStorage.userId), fullname: sessionStorage.fullName, profile: sessionStorage.userProfile };

        // only Administrators can see the list of users .. 
        if (ENVIRONMENT.DEBUG || $scope.currentuser.profile == USRPROFILE.ADMINISTRATOR) {
            $scope.fetchUsers(true);
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

    /* NOT YET SUPPORTED
    $scope.getClass = function(date) {
        return 'info';
        // todo: class value should be 'danger' if date (dd/mm/yyyy) < currentdate, otherwise return 'info'
        // return {'info': date - today <= 0, 'danger': (date - today > 0 && date - today <= 3)};
    };
    */
});

app.controller('userCreateCtrl', function($scope, $modalInstance, item, Data, USRPROFILE, ENVIRONMENT, toastr) {

    $scope.user = angular.copy(item);

    var today = new Date();
    $scope.date = today.toISOString();

    $scope.availableProfiles = [
        { id: USRPROFILE.ADMINISTRATOR, name: USRPROFILE.ADMINISTRATOR },
        { id: USRPROFILE.TESTER, name: USRPROFILE.TESTER },
        { id: USRPROFILE.INCUBATOR, name: USRPROFILE.INCUBATOR },
        { id: USRPROFILE.SAVI, name: USRPROFILE.SAVI },
        { id: USRPROFILE.BUSINESS, name: USRPROFILE.BUSINESS },
    ];

    //todo: getErrorMsg() should become a common function, reuseable in multiple controlleers ..
    $scope.getErrorMsg = function(dataError) {
        if (dataError) {
            return (ENVIRONMENT.DEBUG ? '   [' + dataError.text + ' - ' + dataError.code + ']' : '');
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('Close');
    };

    $scope.action = 'adduser';
    $scope.title = 'Add User';
    $scope.buttonText = 'Add New User';

    var original = item;
    $scope.isClean = function() {
        return angular.equals(original, $scope.user);
    }

    $scope.saveUser = function(user) {

        // user.enddate is passed as yyyy-MM-dd but should become dd/MM/yyyy :
        //todo: delegate the following to a common service ?!
        if (user.enddate) {
            var dt = user.enddate.substr(8, 2) + '/' + user.enddate.substr(5, 2) + '/' + user.enddate.substr(0, 4);
            user.enddate = dt;
        }

        Data.post('user?token=' + sessionStorage.userToken, user).then(function(result) {

            if (result.error) {
                toastr.warning('Technical problem with "creating" new user ' + user.username + $scope.getErrorMsg(result.error));
                $modalInstance.close(null);

            } else {
                var u = angular.copy(user);

                u.fullname = u.firstname + ' ' + u.lastname;

                u.save = 'insert';
                u.id = parseInt(result.data);

                $modalInstance.close(u);
            }
        });
    };
});

app.controller('userEditCtrl', function($scope, $modalInstance, item, Data, USRPROFILE) {

    $scope.user = angular.copy(item);

    var today = new Date();
    $scope.date = today.toISOString();

    // user.enddate in format 'dd/MM/yyyy' needs to be converted into format 'yyyy-MM-dd' :
    //todo: delegate the following to a common service ?!
    var enddate = $scope.user.enddate;
    if (enddate)
        $scope.user.enddate = enddate.substr(6, 4) + '-' + enddate.substr(3, 2) + '-' + enddate.substr(0, 2);

    $scope.availableProfiles = [
        { id: USRPROFILE.ADMINISTRATOR, name: USRPROFILE.ADMINISTRATOR },
        { id: USRPROFILE.TESTER, name: USRPROFILE.TESTER },
        { id: USRPROFILE.INCUBATOR, name: USRPROFILE.INCUBATOR },
        { id: USRPROFILE.SAVI, name: USRPROFILE.SAVI },
        { id: USRPROFILE.BUSINESS, name: USRPROFILE.BUSINESS },
    ];

    $scope.cancel = function() {
        $modalInstance.dismiss('Close');
    };

    $scope.action = 'edituser';
    $scope.title = 'Edit User';
    $scope.buttonText = 'Update User';

    var original = item;
    $scope.isClean = function() {
        return angular.equals(original, $scope.user);
    }

    $scope.saveUser = function(user) {

        // user.enddate is passed as yyyy-MM-dd but should become dd/MM/yyyy :
        //todo: delegate the following to a common service ?!
        if (user.enddate) {
            var dt = user.enddate.substr(8, 2) + '/' + user.enddate.substr(5, 2) + '/' + user.enddate.substr(0, 4);
            user.enddate = dt;
        }

        Data.put('user/' + user.id + '?token=' + sessionStorage.userToken, user).then(function(result) {
            //TODO: complete the following ..

            if (result.status != 'error') {
                var x = angular.copy(user);
                x.save = 'update';

                $modalInstance.close(x);
            } else {
                console.log(result);
            }
        });
    };
});
