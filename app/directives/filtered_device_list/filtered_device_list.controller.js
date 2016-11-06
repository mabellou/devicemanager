app.controller('FilteredDeviceListController', function ($scope) {
    $scope.columns = [
        {text:"Box ID",predicate:"boxid",sortable:true,dataType:"number"},
        {text:"Brand",predicate:"brand",sortable:true},
        {text:"Model",predicate:"model",sortable:true},
        {text:"OS",predicate:"os",sortable:true},
        {text:"OS Version",predicate:"osversion",sortable:true},
        {text:"Screensize",predicate:"screensize",sortable:true},
        {text:"Type",predicate:"type",sortable:true},
        {text:"Status",predicate:"status",sortable:true},
        {text:"Name",predicate:"name",sortable:true},
        {text:"Action",predicate:"",sortable:false}
    ];
    
    $scope.filters = {};

    $scope.filterOnStatus = function (status) {
        return function (device) {
            if (status === 'locked' || status === 'inuse')
                return (device.statusobject.userobject && device.statusobject.userobject.userid === $scope.currentuser.userid) && (device.statusobject.status === status);
            else
                return (!device.statusobject.userobject || device.statusobject.userobject.userid !== $scope.currentuser.userid);
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
    };

    $scope.returnDevice = function (device) {
        // todo: call the BE service ..
        if (device && device.statusobject && device.statusobject.status==='inuse') {
            device.statusobject = { status : 'available', userobject : null };
        }
        /*
        else error ..
        */
    };

    $scope.unlockDevice = function (device) {
         // todo: call the BE service ..
        if (device && device.statusobject && device.statusobject.status==='locked') {
            device.statusobject = { status : 'available', userobject : null };
        }
        /*
        else error ..
        */
    };

    $scope.confirmDevice = function (device) {
        // todo: call the BE service ..
        if (device && device.statusobject && device.statusobject.status==='locked') {
            device.statusobject = { status : 'inuse', userobject : { fullname : 'Marc Vermeir', userid : 6789 }};
        }
        /*
        else error ..
        */
    };

    $scope.lockDevice = function (device) {
        // todo: call the BE service ..
        if (device && device.statusobject && device.statusobject.status==='available') {
            device.statusobject = { status : 'locked', userobject : { fullname : 'Marc Vermeir', userid : 6789 }};
        }
        /*
        else error ..
        */
    };
});