app.controller('devicesCtrl', function ($scope, $modal, $filter, Data) {
    /* todo: get the current user identifier : */
    $scope.currentuserid = 'u76823';

    $scope.devices = {};
    /* todo: activate the 'data' factory :
    Data.get('userdevice').then(function(data){
        $scope.devices = data.data;
    });
    */
    $scope.devices = [{ boxid : 100, brand : 'Apple', model : 'iPhone 6', os : 'iOS', osversion : '10.0.3', screensize : '5 inch', devicetype : 'smartphone', status : 'free', name : '' },
                      { boxid : 200, brand : 'Google', model : 'Pixel', os : 'Android', osversion : '4.5', screensize : '7 inch', devicetype : 'tablet', status : 'locked', name : 'Marwan Bellouti', userid : 'X12345' },
                      { boxid : 300, brand : 'Microsoft', model : 'Lumia 950', os : 'Windows Phone', osversion : '10', screensize : '5.5 inch', devicetype : 'smartphone', status : 'inuse', name : 'Marc Vermeir', userid : 'u76823' },
                      { boxid : 400, brand : 'Microsoft', model : 'Lumia 640', os : 'Windows Phone', osversion : '8.1', screensize : '5.0 inch', devicetype : 'smartphone', status : 'locked', name : 'Marc Vermeir', userid : 'u76823' },
                    ];

    $scope.users = {};
    /* todo: activate the 'data' factory :
    Data.get('users').then(function(data){
        $scope.users = data.data;
    });
    */

    $scope.statusFilter = function (status) {
        return function (device) {
            if (status === 'locked' || status == 'inuse')
                return (device.userid == $scope.currentuserid) && (device.status == status);
            else
                return (device.userid != $scope.currentuserid);
        }
    }
    

    $scope.changeDeviceStatus = function(device){
        if(device.status == "Unavailable"){
            device.status = "Available";
            device.name = "";
            Data.put("devices/"+device.refid,{status:device.status, badgeid: ""});
        }
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
    
    $scope.columns = [
                        {text:"Case-ID",predicate:"boxid",sortable:true,dataType:"number"},
                        {text:"Brand",predicate:"brand",sortable:true},
                        {text:"Model",predicate:"model",sortable:true},
                        {text:"OS",predicate:"os",sortable:true},
                        {text:"OSVersion",predicate:"osversion",sortable:true},
                        {text:"Screensize",predicate:"screensize",sortable:true},
                        {text:"Type",predicate:"devicetype",sortable:true},
                        {text:"Status",predicate:"status",sortable:true},
                        {text:"Name",predicate:"name",sortable:true},
                        {text:"Action",predicate:"",sortable:false}
                    ];

});


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