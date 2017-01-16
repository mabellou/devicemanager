app.controller('devicesCtrl', function($scope, $modal, $filter, $location, $interval, Data, Creds, USRPROFILE, CONFIG, ENVIRONMENT, toastr, Common, MESSAGES) {

    $scope.currentuser = {};
    $scope.devices = {};
    $scope.device = {};

    $interval(function() { $scope.callAtInterval(); }, (ENVIRONMENT.DEBUG ? 60000 : CONFIG.REFRESHINTERVAL));

    $scope.callAtInterval = function() {
        $scope.fetchDevices();
    };

    $scope.isAdministrator = function() {
        return ENVIRONMENT.DEBUG || $scope.currentuser.profile == USRPROFILE.ADMINISTRATOR;
    };

    $scope.fetchDevices = function(notifyUser) {

        Data.get('devices?token=' + sessionStorage.userToken).then(function(data) {
            if (!data) {
                toastr.error(MESSAGES.SERVICENOK);
                return;
            }

            if (!data.error) {
                var devices = data.map(function(device) {
                    // fields 'status' & 'userfullname' are replicated to allow easy filtering in list of devices .. 
                    device.status = device.statusobject.status;
                    if (device.statusobject.userobject)
                        device.userfullname = device.statusobject.userobject.fullname;
                    else
                        device.userfullname = '';

                    return device;
                });
                $scope.devices = devices;

                if (notifyUser)
                    toastr.success('Devices were loaded successfully!');
            } else
            if (notifyUser) {
                toastr.warning('Technical problem in fetching devices!' + Common.GetErrorMessage(ENVIRONMENT.DEBUG, data.error));
            }
        });
    };

    $scope.create = function(p, size) {
        var modalInstance = $modal.open({
            templateUrl: 'partials/devicesEdit.html',
            controller: 'deviceCreateCtrl',
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
                $scope.devices.push(selectedObject);
                $scope.devices = $filter('orderBy')($scope.devices, 'boxid', 'reverse');
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
                            /* capture the user data into a $scope.currentuser object .. */
                            $scope.currentuser = { userid: data.id, fullname: data.fullname, profile: data.profile };

                            sessionStorage.userProfile = $scope.currentuser.profile;
                            sessionStorage.fullName = $scope.currentuser.fullname;

                            toastr.success('User ' + credentials.username + ' authenticated successfully!');

                            $scope.fetchDevices(true);

                        } else {
                            toastr.warning('Technical problem with fetching user ' + sessionStorage.userId + Common.GetErrorMessage(ENVIRONMENT.DEBUG, data.error));
                            $location.path('/login');
                        }
                    });
                }
            } else {
                toastr.warning('Technical problem with authenticating user ' + credentials.username + Common.GetErrorMessage(ENVIRONMENT.DEBUG, data.error));
                Creds.setCredentials('', '');
                $location.path('/login');
            }
        });
    } else {
        $scope.currentuser = { userid: parseInt(sessionStorage.userId), fullname: sessionStorage.fullName, profile: sessionStorage.userProfile };

        $scope.fetchDevices();
    };

    /* OBSOLETE:
    $scope.changeDeviceStatus = function(device) {
            console.log('devicesCtrl.changeDeviceStatus() : NOT SUPPORTED!');
            return;
            
            if(device.status == "Unavailable"){
                device.status = "Available";
                device.name = "";
                Data.put("devices/"+device.refid,{status:device.status, badgeid: ""}); 
            else if(device.status == "Available"){

                var param = {};
                param.device = device;
                param.users = $scope.users;
                var modalInstance = $modal.open({
                  templateUrl: 'partials/userLink.html',
                  controller: 'userLinkCtrl',
                  resolve: {
                    item: function () {
                      return param;
                    }
                  }
                });
                modalInstance.result.then(function(selectedObject) {
                    device.refid = selectedObject.refid;
                    device.caseid = selectedObject.caseid;
                    device.brand = selectedObject.brand;
                    device.model = selectedObject.model;
                    device.os = selectedObject.os;
                    device.badgeid = selectedObject.badgeid;
                    device.status = selectedObject.status;
                    console.log($scope.users);

                    angular.forEach($scope.users, function(user) {
                        if (user.badgeid === selectedObject.badgeid) {
                        selectedObject.name=user.name;
                    }
                    });
                    device.name = selectedObject.name;
                });
            }
    };
    $scope.deleteDevice = function(device){
            if(confirm("Are you sure to remove the device")){
                Data.delete("devices/"+device.refid).then(function(result){
                    $scope.devices = _.without($scope.devices, _.findWhere($scope.devices, {refid:device.refid}));
                });
            }
        };
    */
});

app.controller('deviceCreateCtrl', function($scope, $modalInstance, item, Data, USRPROFILE, ENVIRONMENT, toastr, Common, MESSAGES, DEVTYPE, DEVSTATUS) {

    $scope.device = angular.copy(item);

    $scope.cancel = function() {
        $modalInstance.dismiss('Close');
    };

    $scope.action = 'adddevice';
    $scope.title = 'Add Device';
    $scope.buttonText = 'Add New Device';

    var original = item;
    $scope.isClean = function() {
        return angular.equals(original, $scope.device);
    }

    $scope.availableDeviceTypes = Common.GetDeviceTypes();
    $scope.availableProfiles = Common.GetProfiles();

    $scope.saveDevice = function(device) {

        var device2Save = angular.copy(device);

        Data.post('device?token=' + sessionStorage.userToken, device2Save).then(function(result) {
            if (!result) {
                toastr.error(MESSAGES.SERVICENOK);
                return;
            }

            if (result.error) {
                toastr.warning('Technical problem with "creating" new device ' + device2Save.boxid + Common.GetErrorMessage(ENVIRONMENT.DEBUG, result.error));
                $modalInstance.close(null);
            } else {
                device2Save.save = 'insert';
                device2Save.id = parseInt(result.id);

                device2Save.statusobject = {};
                device2Save.statusobject.status = DEVSTATUS.AVAILABLE;

                $modalInstance.close(device2Save);
            }
        });
    };
});

app.controller('deviceEditCtrl', function($scope, $modalInstance, item, Data, USRPROFILE, MESSAGES, ENVIRONMENT, toastr, Common, DEVTYPE) {

    $scope.device = angular.copy(item);

    $scope.availableDeviceTypes = Common.GetDeviceTypes();
    $scope.availableProfiles = Common.GetProfiles();

    $scope.cancel = function() {
        $modalInstance.dismiss('Close');
    };

    $scope.action = 'editdevice';
    $scope.title = 'Edit Device';
    $scope.buttonText = 'Update Device';

    var original = item;
    $scope.isClean = function() {
        return angular.equals(original, $scope.device);
    }

    $scope.saveDevice = function(device) {
        
        Data.put('device/' + device.id + '?token=' + sessionStorage.userToken, device).then(function(result) {
            if (!result) {
                toastr.error(MESSAGES.SERVICENOK);
                return;
            }

            if (result.error) {
                toastr.warning('Technical problem with "updating" existing device ' + device.boxid + Common.GetErrorMessage(ENVIRONMENT.DEBUG, result.error));
                $modalInstance.close(null);
            } else {
                var d = angular.copy(device);

                d.save = 'update';

                toastr.info('Device ' + d.boxid + ' is updated !');

                $modalInstance.close(d);
            }
        });
    };
});

app.controller('deviceDeleteCtrl', function($scope, $modalInstance, item, Data, toastr, DEVSTATUS) {

    $scope.device = angular.copy(item);
    $scope.device.fullname = $scope.device.boxid + ': ' + $scope.device.brand + ' ' + $scope.device.model;

    $scope.action = 'deletedevice';
    $scope.title = 'Delete Device';
    $scope.buttonText = 'Delete Device';

    $scope.confirm = function(device) {

        var device2Delete = angular.copy(device);

        if (device2Delete.statusobject && device2Delete.statusobject.status == DEVSTATUS.AVAILABLE) {
            // !! deleting a device is a logical delete where the (device) status will become deleted ..    
            var deleteRequest = { id: device2Delete.id, statusobject: { status: DEVSTATUS.DELETED, userobject: null } };

            // call the (VT) service to DELETE the concerned device ..
            Data.post('device/status' + '?token=' + sessionStorage.userToken, deleteRequest).then(function(result) {
                if (!result) {
                    toastr.error(MESSAGES.SERVICENOK);
                    return;
                }

                if (!result.error) {
                    // update the local 'model' ..
                    device2Delete.statusobject = { status: DEVSTATUS.DELETED, userobject: null };
                    toastr.info('Device ' + device2Delete.fullname + ' was "deleted" !');
                    $modalInstance.close(device2Delete);
                } else {
                    toastr.warning('Technical problem with "deleting" device ' + device2Delete.fullname + Common.GetErrorMessage(ENVIRONMENT.DEBUG, data.error));
                    modalInstance.close(null);
                };
            });
        };
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('Close');
    };
});

/* OBSOLETE:
app.controller('userLinkCtrl', function ($scope, $modalInstance, item, Data) {

  $scope.device = angular.copy(item.device);
  $scope.users = angular.copy(item.users);
        
        $scope.cancel = function () {
            $modalInstance.dismiss('Close');
        };
        $scope.title = 'Taken by' ;
        $scope.buttonText = 'Add to user devices';

        var original = item;
        $scope.isClean = function() {
            return angular.equals(original, $scope.device);
        }
        $scope.saveDevice = function (device) {
                device.status = "Unavailable";
                var devicetemp = angular.copy(device);
                delete devicetemp.name;
                Data.put('devices/'+devicetemp.refid, devicetemp).then(function (result) {
                    if(result.status != 'error'){
                        var x = angular.copy(device);
                        $modalInstance.close(x);
                    }else{
                        console.log(result);
                    }
                });
        };
});
*/
