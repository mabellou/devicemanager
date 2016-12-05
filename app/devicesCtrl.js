app.controller('devicesCtrl', function($scope, $modal, $filter, $location, $interval, Data, Creds, USRPROFILE, CONFIG, toastr) {

    $scope.currentuser = {};
    $scope.devices = {};

    //TODO: $interval( function(){ $scope.callAtInterval(); }, CONFIG.REFRESHINTERVAL);

    $scope.fetchDevices = function(notifyUser) {
        Data.get('devices?token=' + sessionStorage.userToken).then(function(data) {
            if (data) {
                $scope.devices = data;
                if (notifyUser)
                    toastr.success('Devices were loaded successfully!');
            } else
            if (notifyUser)
                toastr.warning('Technical problem in fetching devices!');
        });
    };

    $scope.callAtInterval = function() {
        $scope.fetchDevices();
    };

    /*
    $scope.create = function (p,size) {
        var modalInstance = $modal.open({
          templateUrl: 'partials/devicesEdit.html',
          controller: 'deviceCreateCtrl',
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
                $scope.devices.push(selectedObject);
                $scope.devices = $filter('orderBy')($scope.devices, 'caseid');
        });
    };
    */

    /* authenticate the 'current user' ?! .. */
    if (!sessionStorage.userToken || sessionStorage.userToken == '') {
        /* var credentials = { username : 'marcvermeir', password : 'azerty' }; */
        var credentials = Creds.getCredentials();
        if (credentials.username == '' || credentials.password == '') {
            $location.path('/login');
        }

        Data.post('authenticate', credentials).then(function(data) {
            if (data) {
                sessionStorage.userToken = data.token;
                sessionStorage.userId = data.userid;

                /* get the user info of the 'current user' .. */
                if (!sessionStorage.userToken || sessionStorage.userToken == '') {
                    $location.path('/login');
                } else {
                    /* call the (VT) Service to fetch the 'current user' info .. */
                    Data.get('user/' + sessionStorage.userId + '?token=' + sessionStorage.userToken).then(function(data) {
                        if (data) {
                            /* capture the user data into a $scope.currentuser object .. */
                            $scope.currentuser = { userid: data.id, fullname: data.fullname, profile: data.profile };
                            sessionStorage.userProfile = $scope.currentuser.profile;

                            toastr.success('User ' + credentials.username + ' authenticated successfully!');

                            $scope.fetchDevices(true);
                        }
                        else
                            toastr.warning('Technical problem with fetching user ' + sessionStorage.userId);
                    });
                }
            } else
                toastr.warning('Technical problem with authenticating user ' + credentials.username);
        });
        // quid error(s) returned ?
    } else {
        $scope.currentuser = { profile: sessionStorage.userProfile };

        $scope.fetchDevices();
    };



    /* ???
    $scope.IsAdministrator = function() {
        return ($scope.currentuser.profile == USRPROFILE.ADMINISTRATOR)
    };
    */

    /* NOT YET SUPPORTED
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

        $scope.open = function (p,size) {
            var modalInstance = $modal.open({
              templateUrl: 'partials/devicesEdit.html',
              controller: 'deviceEditCtrl',
              size: size,
              resolve: {
                item: function () {
                  return p;
                }
              }
            });
            modalInstance.result.then(function(selectedObject) {
                    p.refid = selectedObject.refid;
                    p.caseid = selectedObject.caseid;
                    p.brand = selectedObject.brand;
                    p.model = selectedObject.model;
                    p.os = selectedObject.os;
            });
        };
        
        $scope.create = function (p,size) {
            var modalInstance = $modal.open({
              templateUrl: 'partials/devicesEdit.html',
              controller: 'deviceCreateCtrl',
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
                    $scope.devices.push(selectedObject);
                    $scope.devices = $filter('orderBy')($scope.devices, 'caseid');
            });
        };
        
    */

});

/* NOT YET SUPPORTED

app.controller('deviceEditCtrl', function ($scope, $modalInstance, item, Data) {

  $scope.device = angular.copy(item);
        
        $scope.cancel = function () {
            $modalInstance.dismiss('Close');
        };
        $scope.title = 'Edit Device' ;
        $scope.buttonText = 'Update Device';

        var original = item;
        $scope.isClean = function() {
            return angular.equals(original, $scope.device);
        }
        $scope.saveDevice = function (device) {
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

app.controller('deviceCreateCtrl', function ($scope, $modalInstance, item, Data) {

  $scope.device = angular.copy(item);
        
        $scope.cancel = function () {
            $modalInstance.dismiss('Close');
        };
        $scope.title = 'Add Device' ;
        $scope.buttonText = 'Add New Device';

        var original = item;
        $scope.isClean = function() {
            return angular.equals(original, $scope.device);
        }
        $scope.saveDevice = function (device) {
                device.status = 'Available';
                Data.post('devices', device).then(function (result) {
                    if(result.status != 'error'){
                        var x = angular.copy(device);
                        x.save = 'insert';
                        x.id = result.data;
                        $modalInstance.close(x);
                    }else{
                        console.log(result);
                    }
                });
        };
});
*/
