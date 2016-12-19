app.controller('FilteredDeviceListController', function($scope, Data, DEVSTATUS, CONFIG, USRPROFILE, ENVIRONMENT, DEVTYPE, toastr) {

    $scope.columns = [
        { text: "Box ID", predicate: "boxid", sortable: true, dataType: "number" },
        { text: "Brand", predicate: "brand", sortable: true },
        { text: "Model", predicate: "model", sortable: true },
        { text: "OS", predicate: "os", sortable: true },
        { text: "OS Version", predicate: "osversion", sortable: true },
        { text: "Screensize", predicate: "screensize", sortable: true },
        { text: "Type", predicate: "type", sortable: true },
        { text: "Status", predicate: "status", sortable: true },
        { text: "Name", predicate: "fullname", sortable: true },
        { text: "Action", predicate: "", sortable: false }
    ];

    $scope.filters = {};

    $scope.isAdministrator = function() {
        return $scope.currentuser.profile == USRPROFILE.ADMINISTRATOR;
    };
    $scope.isBusiness = function() {
        return $scope.currentuser.profile == USRPROFILE.BUSINESS;
    }
    $scope.isTester = function() {
        return $scope.currentuser.profile == USRPROFILE.TESTER;
    }
    $scope.isIncubator = function() {
        return $scope.currentuser.profile == USRPROFILE.INCUBATOR;
    }
    $scope.isSavi = function() {
        return $scope.currentuser.profile == USRPROFILE.SAVI;
    }
    
    $scope.isSmartphone = function(device) {
        return device.type == DEVTYPE.SMARTPHONE;
    };

    $scope.isTablet = function(device) {
        return device.type == DEVTYPE.TABLET;
    };

    $scope.isInUse = function(status) {
        return status == DEVSTATUS.INUSE;
    };

    $scope.isAvailable = function(status) {
        return status == DEVSTATUS.AVAILABLE;
    };

    $scope.isLocked = function(status) {
        return status == DEVSTATUS.LOCKED;
    };

    $scope.countDevices4CurrentUser = function() {
        var count = 0;

        // ..count the devices InUse or Locked by the current user ..
        angular.forEach($scope.devices, function(device) {
            if ((device.statusobject.status == DEVSTATUS.LOCKED || device.statusobject.status == DEVSTATUS.INUSE) &&
                (device.statusobject.userobject && device.statusobject.userobject.userid == $scope.currentuser.userid))
                count++;
        });

        return count;
    };

    $scope.lockDisabled = function() {
        // .. constraint implemented : a 'VT' user can have maxium .. devices in use or locked :
        return $scope.countDevices4CurrentUser() >= CONFIG.MAXDEVICES4CURUSR;
    };

    $scope.filterOnStatus = function(status) {
        return function(device) {
            if (status == DEVSTATUS.LOCKED || status == DEVSTATUS.INUSE)
                return (device.statusobject.userobject && device.statusobject.userobject.userid == $scope.currentuser.userid) && (device.statusobject.status === status);
            else
                return (!device.statusobject.userobject || device.statusobject.userobject.userid !== $scope.currentuser.userid);
        }
    };

    $scope.deviceConstraintVialotion = function() {
        // constraint :
        // Max. duration IN USE per device:
        //  a.    Business user: 48 hrs
        //  b.    Tester || Incubator || Savi user : either 5 hrs, or EOB

        if ($scope.isBusiness) {
            //TODO...
            
        }
        if ($scope.isTester || $scope.isIncubator || $scope.isSavi) {
            //TODO...
        }                                    
        return false;
    };

    $scope.formatStatus = function(status) {
        return status == DEVSTATUS.INUSE ? 'in use' : status;
    };

    $scope.clearFilters = function() {
        $scope.filters = {};
    };

    $scope.returnDevice = function(device) {

        if (device && device.statusobject && device.statusobject.status == DEVSTATUS.INUSE) {

            var returnRequest = { id: device.id, statusobject: { status: DEVSTATUS.AVAILABLE, userobject: null } };

            /* call the (VT) service to RETURN the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, returnRequest).then(function(data) {
                if (data) {
                    /* update the local 'model' .. */
                    device.statusobject = { status: DEVSTATUS.AVAILABLE, userobject: null };
                    toastr.info('Device ' + device.boxid + '   ' + device.brand + ' ' + device.model + ' was "returned" !');
                } else
                    toastr.warning('Technical problem with "returning" device ' + device.boxid);
            });
        };
    };

    $scope.unlockDevice = function(device) {

        if (device && device.statusobject && device.statusobject.status == DEVSTATUS.LOCKED) {

            var unlockRequest = { id: device.id, statusobject: { status: DEVSTATUS.AVAILABLE, userobject: null } };

            /* call the (VT) service to UNLOCK the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, unlockRequest).then(function(data) {
                if (data) {
                    /* update the local 'model' .. */
                    device.statusobject = { status: DEVSTATUS.AVAILABLE, userobject: null };
                    toastr.info('Device ' + device.boxid + '   ' + device.brand + ' ' + device.model + ' was "unlocked" !');
                } else
                    toastr.warning('Technical problem with "unlocking" device ' + device.boxid);
            });
        };
    };

    $scope.confirmDevice = function(device) {

        if (device && device.statusobject && device.statusobject.status == DEVSTATUS.LOCKED) {

            // alert($scope.currentuser.userid);
            var confirmRequest = { id: device.id, statusobject: { status: DEVSTATUS.INUSE, userobject: { userid: $scope.currentuser.userid } } };

            /* call the (VT) service to CONFIRM the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, confirmRequest).then(function(data) {
                if (data) {
                    /* update the local 'model' .. */
                    device.statusobject = { status: DEVSTATUS.INUSE, userobject: { fullname: $scope.currentuser.fullname, userid: $scope.currentuser.userid } };
                    toastr.info('Device ' + device.boxid + '   ' + device.brand + ' ' + device.model + ' was "confirmed" !');
                } else
                    toastr.warning('Technical problem with "confirming" device ' + device.boxid);
            });
        };
    };

    $scope.lockDevice = function(device) {

        if (device && device.statusobject && device.statusobject.status == DEVSTATUS.AVAILABLE) {

            // alert($scope.currentuser.userid);
            var lockRequest = { id: device.id, statusobject: { status: DEVSTATUS.LOCKED, userobject: { userid: $scope.currentuser.userid } } };

            /* call the (VT) service to LOCK the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, lockRequest).then(function(data) {
                if (data) {
                    /* update the local 'model' .. */
                    device.statusobject = { status: DEVSTATUS.LOCKED, userobject: { fullname: $scope.currentuser.fullname, userid: $scope.currentuser.userid } };
                    toastr.info('Device ' + device.boxid + '   ' + device.brand + ' ' + device.model + ' was "locked" !');
                } else
                    toastr.warning('Technical problem with "locking" device ' + device.boxid);
            });
        };
    };
});
