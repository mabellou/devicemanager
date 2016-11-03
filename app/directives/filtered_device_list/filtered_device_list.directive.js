app.directive("filteredDeviceList", function () {
    return {
        restrict: "E",
        controller: "FilteredDeviceListController",
        templateUrl: 'app/directives/filtered_device_list/filtered_device_list.html',
        scope: {
            filteredStatus: "=",
            devices: "=",
            currentuser: "=",
            filterDevices: "="
        }
    };
}); 