app.controller('FilteredDeviceListController', function ($scope, Data, DEVSTATUS, CONFIG, toastr) {

    // console.log($scope.currentuser.profile);

    $scope.columns = [
        {text:"Box ID",predicate:"boxid",sortable:true,dataType:"number"},
        {text:"Brand",predicate:"brand",sortable:true},
        {text:"Model",predicate:"model",sortable:true},
        {text:"OS",predicate:"os",sortable:true},
        {text:"OS Version",predicate:"osversion",sortable:true},
        {text:"Screensize",predicate:"screensize",sortable:true},
        {text:"Type",predicate:"type",sortable:true},
        {text:"Status",predicate:"status",sortable:true},
        {text:"Name",predicate:"fullname",sortable:true},
        {text:"Action",predicate:"",sortable:false}
    ];
    
    $scope.filters = {};

    $scope.countDevices4CurrentUser = function () {
        var count = 0;

        // ..count the devices InUse or Locked by the current user ..
        angular.forEach($scope.devices, function(device) {
            if ((device.statusobject.status == DEVSTATUS.LOCKED || device.statusobject.status == DEVSTATUS.INUSE) &&
                (device.statusobject.userobject && device.statusobject.userobject.userid == $scope.currentuser.userid))
                count++;
        });

        return count;
    };

    $scope.lockDisabled = function () {
        // .. constraint implemented : a 'VT' user can have maxium .. devices in use or locked :
        return $scope.countDevices4CurrentUser() >= CONFIG.MAXDEVICES4CURUSR;
    };

    $scope.filterOnStatus = function (status) {
        return function (device) {
            if (status == DEVSTATUS.LOCKED || status == DEVSTATUS.INUSE)
                return (device.statusobject.userobject && device.statusobject.userobject.userid == $scope.currentuser.userid) && (device.statusobject.status === status);
            else
                return (!device.statusobject.userobject || device.statusobject.userobject.userid !== $scope.currentuser.userid);
        }
    };

    $scope.getClass = function() {
        return 'info'
    };

    $scope.formatStatus = function (status) {
        return status == DEVSTATUS.INUSE ? 'in use' : status;
    };

    $scope.clearFilters = function () {
        $scope.filters = {};
    };

    $scope.returnDevice = function (device) {
        
        if (device && device.statusobject && device.statusobject.status == DEVSTATUS.INUSE) {

            var returnRequest = { id : device.id, statusobject : { status : DEVSTATUS.AVAILABLE, userobject : null }};

            /* call the (VT) service to RETURN the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, returnRequest).then(function(data) {
                /* update the local 'model' .. */
                device.statusobject = { status : DEVSTATUS.AVAILABLE, userobject : null };
                toastr.info('Device ' + device.boxid + '   ' + device.brand + ' ' + device.model + ' returned!');
                /* quid the error(s) ?! .. todo: handle error(s) ?! */
            });
        };
        /* //todo: else raise error .. */
    };

    $scope.unlockDevice = function (device) {
        
        if (device && device.statusobject && device.statusobject.status == DEVSTATUS.LOCKED) {

            var unlockRequest = { id : device.id, statusobject : { status : DEVSTATUS.AVAILABLE, userobject : null }};

            /* call the (VT) service to UNLOCK the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, unlockRequest).then(function(data) {
                /* update the local 'model' .. */
                device.statusobject = { status : DEVSTATUS.AVAILABLE, userobject : null };
                toastr.info('Device ' + device.boxid + '   ' + device.brand + ' ' + device.model + ' unlocked!');

                /* quid the error(s) ?! .. todo: handle error(s) ?! */
            });
        };
       /* //todo: else raise error ?! */
    };

    $scope.confirmDevice = function (device) {
    
        if (device && device.statusobject && device.statusobject.status == DEVSTATUS.LOCKED) {

            var confirmRequest = { id: device.id, statusobject : { status : DEVSTATUS.INUSE, userobject : { userid : $scope.currentuser.userid }}};

            /* call the (VT) service to CONFIRM the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, confirmRequest).then(function(data) {
                /* update the local 'model' .. */
                device.statusobject = { status : DEVSTATUS.INUSE, userobject : { fullname : $scope.currentuser.fullname, userid : $scope.currentuser.userid }};
                toastr.info('Device ' + device.boxid + '   ' + device.brand + ' ' + device.model + ' confirmed!');
                /* quid the error(s) ?! .. todo: handle error(s) ?! */
            });
        };
        /* //todo: else raise error ?! */
    };

    $scope.lockDevice = function (device) {
        
        if (device && device.statusobject && device.statusobject.status == DEVSTATUS.AVAILABLE) {

            var lockRequest = { id : device.id, statusobject : { status : DEVSTATUS.LOCKED, userobject : { userid : $scope.currentuser.userid }}};

            /* call the (VT) service to LOCK the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, lockRequest).then(function(data) {
                /* update the local 'model' .. */
                device.statusobject = { status : DEVSTATUS.LOCKED, userobject : { fullname : $scope.currentuser.fullname, userid : $scope.currentuser.userid }};
                toastr.info('Device ' + device.boxid + '   ' + device.brand + ' ' + device.model + ' locked!');
                /* quid the error(s) ?! .. todo: handle error(s) ?! */
            });
        };
        /* //todo: else raise error ?! */
    };
});