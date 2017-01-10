app.controller('usersCtrl', function($scope, $modal, $filter, $location, $interval, Data, Creds, USRPROFILE, CONFIG, ENVIRONMENT, toastr, Common, MESSAGES) {

    $scope.currentuser = {};
    $scope.users = [];
    $scope.user = {};

    $interval(function() { $scope.callAtInterval(); }, (ENVIRONMENT.DEBUG ? 60000 : CONFIG.REFRESHINTERVAL));

    $scope.callAtInterval = function() {
        $scope.fetchUsers();
    };

    $scope.isAdministrator = function() {
        return ENVIRONMENT.DEBUG || $scope.currentuser.profile == USRPROFILE.ADMINISTRATOR;
    };

    $scope.fetchUsers = function(notifyUser) {

        Data.get('users?token=' + sessionStorage.userToken).then(function(data) {
            if (!data) {
                toastr.error(MESSAGES.SERVICENOK);
                return;
            }

            if (!data.error) {
                $scope.users = data;
                if (notifyUser)
                    toastr.success('Users were loaded successfully!');
            } else {
                if (notifyUser)
                    toastr.warning('Technical problem with fetching users!' + Common.GetErrorMessage(ENVIRONMENT.DEBUG, data.error));
            }
        });
    };

    $scope.deleteUser = function(user, size) {

        // !! deleting a user is a logical delete where the enddate will be set equal to today
        //// var user2delete = angular.copy(user);
        //// var username = user2delete.firstname + ' ' + user2delete.lastname;

        var modalInstance = $modal.open({
            templateUrl: 'partials/userDelete.html',
            controller: 'userDeleteCtrl',
            size: size,
            resolve: {
                item: function() {
                    return user;
                }
            }
        });
        modalInstance.result.then(function(selectedObject) {
            if (selectedObject) {
                // update the 'model' : only the enddate is filled in with the current date :
                user.enddate = selectedObject.enddate;
            }
        });
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
        var credentials = Creds.getCredentials();
        if (credentials.username == '' || credentials.password == '') {
            $location.path('/login');
        }

        Data.post('authenticate', credentials).then(function(data) {
            if (!data) {
                toastr.error(MESSAGES.SERVICENOK);
                return;
            }

            if (!data.error) {
                sessionStorage.userToken = data.token;
                sessionStorage.userId = data.userid;

                /* get the user info of the 'current user' .. */
                if (!sessionStorage.userToken || sessionStorage.userToken == '') {
                    $location.path('/login');
                } else {
                    /* call the (VT) Service to fetch the 'current user' info .. */
                    Data.get('user/' + sessionStorage.userId + '?token=' + sessionStorage.userToken).then(function(data) {
                        if (!data) {
                            toastr.error(MESSAGES.SERVICENOK);
                            return;
                        }

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
                            toastr.warning('Technical problem with fetching user ' + sessionStorage.userId + Common.GetErrorMessage(ENVIRONMENT.DEBUG, data.error));
                            $location.path('/login');
                        }
                    });
                }
            } else {
                toastr.warning('Technical problem with authenticating user ' + credentials.username + Common.GetErrorMessage(ENVIRONMENT.DEBUG, data.error));
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

    // define the visible columns in the list of users :
    $scope.columns = [{ text: "Badge ID", predicate: "badgeid", sortable: true, dataType: "number" },
        { text: "Name", predicate: "fullname", sortable: true },
        { text: "Profile", predicate: "profile", sortable: true },
        { text: "Active Until", predicate: "enddate", sortable: true },
        { text: "#Devices Locked", predicate: "counterlocked", sortable: true, dataType: "number" },
        { text: "#Devices In Use", predicate: "counterinuse", sortable: true, dataType: "number" },
        { text: "Action", predicate: "", sortable: false }
    ];
});

app.controller('userDeleteCtrl', function($scope, $modalInstance, item, Data, toastr) {

    $scope.user = angular.copy(item);
    $scope.user.fullname = $scope.user.firstname + ' ' + $scope.user.lastname;

    $scope.action = 'deleteuser';
    $scope.title = 'Delete User'; 
    $scope.buttonText = 'Delete User';

    $scope.confirm = function(user) {

        var user2Delete = angular.copy(user);

        // set the user's enddate equal to today :
        user2Delete.enddate = moment().format('DD/MM/YYYY');

        Data.put('user/' + user2Delete.id + '?token=' + sessionStorage.userToken, user2Delete).then(function(result) {
            if (!result) {
                toastr.error(MESSAGES.SERVICENOK);
                return;
            };

            if (result.error) {
                toastr.warning('Technical problem with "deleting" user ' + user2Delete.fullname + Common.GetErrorMessage(ENVIRONMENT.DEBUG, result.error));
                $modalInstance.close(null);
            } else {
                toastr.info('User ' + user2Delete.fullname + ' was removed successfully !');

                $modalInstance.close(user2Delete);
            };
        });
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('Close');
    };
});

app.controller('userCreateCtrl', function($scope, $modalInstance, item, Data, USRPROFILE, ENVIRONMENT, toastr, Common, MESSAGES) {

    $scope.user = angular.copy(item);

    var today = new Date();
    $scope.date = today.toISOString();

    $scope.availableProfiles = Common.GetProfiles();

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

        var user2Save = angular.copy(user);

        // (user) enddate is passed as yyyy-MM-dd but should become dd/MM/yyyy :
        //todo: delegate the following to a common service || use momentjs ?!
        if (user2Save.enddate) {
            var dt = user2Save.enddate.substr(8, 2) + '/' + user2Save.enddate.substr(5, 2) + '/' + user2Save.enddate.substr(0, 4);
            user2Save.enddate = dt;
        }

        Data.post('user?token=' + sessionStorage.userToken, user2Save).then(function(result) {
            if (!result) {
                toastr.error(MESSAGES.SERVICENOK);
                return;
            }

            if (result.error) {
                toastr.warning('Technical problem with "creating" new user ' + user2Save.username + Common.GetErrorMessage(ENVIRONMENT.DEBUG, result.error));
                $modalInstance.close(null);

            } else {
                user2Save.fullname = user2Save.firstname + ' ' + user2Save.lastname;

                user2Save.save = 'insert';
                user2Save.id = parseInt(result.id);

                toastr.info('User ' + user2Save.fullname + ' is created !');

                $modalInstance.close(user2Save);
            }
        });
    };
});

app.controller('userEditCtrl', function($scope, $modalInstance, item, Data, USRPROFILE, MESSAGES, toastr, Common) {

    $scope.user = angular.copy(item);

    // (user) enddate in format 'dd/MM/yyyy' needs to be converted again
    // into format 'yyyy-MM-dd', the latter format acts as input 4 the datepicker :
    //todo: delegate the following to a common service ?!
    var enddate = $scope.user.enddate;
    if (enddate)
        $scope.user.enddate = enddate.substr(6, 4) + '-' + enddate.substr(3, 2) + '-' + enddate.substr(0, 2);

    var today = new Date();
    $scope.date = today.toISOString();

    $scope.availableProfiles = Common.GetProfiles();

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

        var user2Save = angular.copy(user);

        // (user) enddate is passed as yyyy-MM-dd but should become dd/MM/yyyy :
        //todo: delegate the following to a common service || use momentjs ?!
        if (user2Save.enddate) {
            var dt = user2Save.enddate.substr(8, 2) + '/' + user2Save.enddate.substr(5, 2) + '/' + user2Save.enddate.substr(0, 4);
            user2Save.enddate = dt;
        }

        Data.put('user/' + user2Save.id + '?token=' + sessionStorage.userToken, user2Save).then(function(result) {
            if (!result) {
                toastr.error(MESSAGES.SERVICENOK);
                return;
            }

            if (result.error) {
                toastr.warning('Technical problem with "updating" existing user ' + user2Save.username + Common.GetErrorMessage(ENVIRONMENT.DEBUG, result.error));
                $modalInstance.close(null);

            } else {
                user2Save.fullname = user2Save.firstname + ' ' + user2Save.lastname;

                user2Save.save = 'update';

                toastr.info('User ' + user2Save.fullname + ' is updated !');

                $modalInstance.close(user2Save);
            }
        });
    };
});
