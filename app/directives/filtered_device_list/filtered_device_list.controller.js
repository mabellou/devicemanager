app.controller('FilteredDeviceListController', function ($scope, Data) {

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
            if (status == 'locked' || status == 'inuse')
                return (device.statusobject.userobject && device.statusobject.userobject.userid == $scope.currentuser.userid) && (device.statusobject.status === status);
            else
                return (!device.statusobject.userobject || device.statusobject.userobject.userid !== $scope.currentuser.userid);
        }
    };

    $scope.getClass = function() {
        return 'info';
    };

    $scope.formatStatus = function (status) {
        return status == 'inuse' ? 'in use' : status;
    };

    $scope.clearFilters = function () {
        $scope.filters = {};
    };

    $scope.returnDevice = function (device) {
        
        if (device && device.statusobject && device.statusobject.status == 'inuse') {

            var returnRequest = { id: device.id, statusobject : { status : 'available', userobject : null }};

            /* call the (VT) service to RETURN the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, returnRequest).then(function(data) {
                /* update the local 'model' .. */
                device.statusobject = { status : 'available', userobject : null };

                /* quid the error(s) ?! .. todo: handle error(s) ?! */
            });

            /* INITIAL :
                device.statusobject = { status : 'available', userobject : null } ;
            */
        };
        /*
        else error ..
        */
    };

    $scope.unlockDevice = function (device) {
        
        if (device && device.statusobject && device.statusobject.status == 'locked') {

            var unlockRequest = { id: device.id, statusobject : { status : 'available', userobject : null }};

            /* call the (VT) service to UNLOCK the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, unlockRequest).then(function(data) {
                /* update the local 'model' .. */
                device.statusobject = { status : 'available', userobject : null };

                /* quid the error(s) ?! .. todo: handle error(s) ?! */
            });

            /* INITIAL :
                device.statusobject = { status : 'available', userobject : null };
            */
        };
       /*
            //todo: else raise error ?!
        */
    };

    $scope.confirmDevice = function (device) {
    
        if (device && device.statusobject && device.statusobject.status == 'locked') {

            var confirmRequest = { id: device.id, statusobject : { status : 'inuse', userobject : { userid : $scope.currentuser.userid }}};

            /* call the (VT) service to CONFIRM the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, confirmRequest).then(function(data) {
                /* update the local 'model' .. */
                device.statusobject = { status : 'inuse', userobject : { fullname : $scope.currentuser.fullname, userid : $scope.currentuser.userid }};

                /* quid the error(s) ?! .. todo: handle error(s) ?! */
            });

            /* INITIAL :
                device.statusobject = { status : 'inuse', userobject : { fullname : 'Marc Vermeir', userid : 6789 }};
            */
        };
        /*
            //todo: else raise error ?!
        */
    };

    $scope.lockDevice = function (device) {
        
        if (device && device.statusobject && device.statusobject.status == 'available') {

            var lockRequest = { id: device.id, statusobject : { status : 'locked', userobject : { userid : $scope.currentuser.userid }}};

            /* call the (VT) service to LOCK the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, lockRequest).then(function(data) {
                /* update the local 'model' .. */
                device.statusobject = { status : 'locked', userobject : { fullname : $scope.currentuser.fullname, userid : $scope.currentuser.userid }};

                /* quid the error(s) ?! .. todo: handle error(s) ?! */
            });

            /* INITIAL :
                device.statusobject = { status : 'locked', userobject : { fullname : $scope.currentuser.fullname, userid : $scope.currentuser.userid }};
            */
        };
        /*
            //todo: else raise error ?!
        */
    };
});