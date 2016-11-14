app.controller('FilteredDeviceListController', function ($scope, Data, DEVSTATUS) {

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

    $scope.filterOnStatus = function (status) {
        return function (device) {
            if (status == DEVSTATUS.LOCKED || status == DEVSTATUS.INUSE)
                return (device.statusobject.userobject && device.statusobject.userobject.userid == $scope.currentuser.userid) && (device.statusobject.status === status);
            else
                return (!device.statusobject.userobject || device.statusobject.userobject.userid !== $scope.currentuser.userid);
        }
    };

    $scope.getClass = function() {
        return 'info';
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

                /* quid the error(s) ?! .. todo: handle error(s) ?! */
            });
        };
        /* //todo: else raise error ?! */
    };
});