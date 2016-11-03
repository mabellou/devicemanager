app.controller('FilteredDeviceListController', function ($scope) {
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
    $scope.statusFilter = function (status) {
        return function (device) {
            if (status === 'locked' || status == 'inuse')
                return (device.devicestatus.user && device.devicestatus.user.id == $scope.currentuser.id) && (device.devicestatus.status == status);
            else
                return (!device.devicestatus.user || device.devicestatus.user.id != $scope.currentuser.id);
        }
    }
});