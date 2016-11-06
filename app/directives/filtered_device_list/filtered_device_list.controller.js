app.controller('FilteredDeviceListController', function ($scope) {
    $scope.columns = [
        {text:"Box ID",predicate:"boxid",sortable:true,dataType:"number"},
        {text:"Brand",predicate:"brand",sortable:true},
        {text:"Model",predicate:"model",sortable:true},
        {text:"OS",predicate:"os",sortable:true},
        {text:"OS Version",predicate:"osversion",sortable:true},
        {text:"Screensize",predicate:"screensize",sortable:true},
        {text:"Type",predicate:"devicetype",sortable:true},
        {text:"Status",predicate:"status",sortable:true},
        {text:"Name",predicate:"name",sortable:true},
        {text:"Action",predicate:"",sortable:false}
    ];
    
    $scope.filters = {};

    $scope.filterOnStatus = function (status) {
        return function (device) {
            if (status === 'locked' || status === 'inuse')
                return (device.devicestatus.user && device.devicestatus.user.id === $scope.currentuser.id) && (device.devicestatus.status === status);
            else
                return (!device.devicestatus.user || device.devicestatus.user.id !== $scope.currentuser.id);
        }
    };

    $scope.getClass = function() {
        return 'info';
    };

    $scope.formatStatus = function (status) {
        return status === 'inuse' ? 'in use' : status;
    };

    $scope.clearFilters = function () {
        $scope.filters = {};
        /*
        for(key in $scope.filters) {
            var value = $scope.filters[key];
            console.log(value);

            $scope.filters[key] = null;
        }
        */
    };

    $scope.returnDevice = function (device) {
        // todo: call the BE service ..
        if (device && device.devicestatus && device.devicestatus.status==='inuse') {
            device.devicestatus = { status : 'available', user : null };
        }
        /*
        else error ..
        */
    };

    $scope.unlockDevice = function (device) {
         // todo: call the BE service ..
        if (device && device.devicestatus && device.devicestatus.status==='locked') {
            device.devicestatus = { status : 'available', user : null };
        }
        /*
        else error ..
        */
    };

    $scope.confirmDevice = function (device) {
        // todo: call the BE service ..
        if (device && device.devicestatus && device.devicestatus.status==='locked') {
            device.devicestatus = { status : 'inuse', user : { fullname : 'Marc Vermeir', id : 6789 }};
        }
        /*
        else error ..
        */
    };

    $scope.lockDevice = function (device) {
        // todo: call the BE service ..
        if (device && device.devicestatus && device.devicestatus.status==='available') {
            device.devicestatus = { status : 'locked', user : { fullname : 'Marc Vermeir', id : 6789 }};
        }
        /*
        else error ..
        */
    };
});