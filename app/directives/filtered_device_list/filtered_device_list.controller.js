app.controller('FilteredDeviceListController', function($scope, $modal, Data, DEVSTATUS, CONFIG, USRPROFILE, ENVIRONMENT, DEVTYPE, toastr, moment, Common, MESSAGES) {

    // define the visible columns in the list of devices :
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
        return ENVIRONMENT.DEBUG || $scope.currentuser.profile == USRPROFILE.ADMINISTRATOR;
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

        // == count the devices InUse or Locked by the current user ..
        angular.forEach($scope.devices, function(device) {
            if ((device.statusobject.status == DEVSTATUS.LOCKED || device.statusobject.status == DEVSTATUS.INUSE) &&
                (device.statusobject.userobject && device.statusobject.userobject.userid == $scope.currentuser.userid))
                count++;
        });

        return count;
    };

    $scope.lockDisabled = function() {
        // == constraint implemented : a 'VT' user can have maxium .. devices in use or locked :
        return $scope.countDevices4CurrentUser() >= CONFIG.MAXDEVICES4CURUSR;
    };

    $scope.filterOnStatus = function(status) {
        return function(device) {
            if (status == DEVSTATUS.LOCKED || status == DEVSTATUS.INUSE)
                return (device.statusobject.userobject && device.statusobject.userobject.userid == $scope.currentuser.userid) && (device.statusobject.status === status);
            else
                //// return (!device.statusobject.userobject || device.statusobject.userobject.userid !== $scope.currentuser.userid);
                return (!device.statusobject.userobject || (device.statusobject.userobject && device.statusobject.userobject.userid !== $scope.currentuser.userid));
        }
    };

    $scope.deviceConstraintViolation = function(device, filteredStatus) {
        // checks device constraint(s) :
        // Max. duration IN USE per device:
        //  a.    Business user: 48 hrs
        //  b.    Tester || Incubator || Savi user : either 5 hrs, or EOB aka 19.00 PM

        // but first check if this constraint makes sense ? :
        var filteredStatusLockedOrInUse = (filteredStatus == DEVSTATUS.LOCKED ||
            filteredStatus == DEVSTATUS.INUSE);
        var deviceStatusLockedOrInUse = (device.statusobject.status == DEVSTATUS.LOCKED ||
            device.statusobject.status == DEVSTATUS.INUSE);
        if (!(filteredStatusLockedOrInUse || deviceStatusLockedOrInUse)) return false;

        // get the maximum hours a device can be in use by a Tester || Incubator || Savi teammember :
        var maxHoursInUse4TIS = parseInt(CONFIG.MAXHRSINUSEBYTIS);
        // get the maximum hours a device can be in use by a Business teammember :
        var maxHoursInUse4B = parseInt(CONFIG.MAXHRSINUSEBYB);

        /*
        if (ENVIRONMENT.DEBUG) {
            // >>> MM/dd/yyyy hh:mm:ss
            device.statusobject.statusdate = '12/27/2016 12:10:00';         
        };
        */

        if (device.statusobject && device.statusobject.statusdate) {

            var statusdate = moment(device.statusobject.statusdate, 'DD/MM/YYYY hh:mm:ss');

            // is current user member of the 'business' team ?
            if ($scope.isBusiness()) {
                // add the maximum hours in use 4 business people : 
                var statusdateplus = moment(statusdate).add(maxHoursInUse4B, 'h');
                // compare statusdateplus with now (= actual datetime) .. 
                // if now > statusdateplus then return true else false :
                return moment().isAfter(statusdateplus);
            }

            // OR is current user member of the Testers || Incubator || SAVI team ?
            if ($scope.isTester() || $scope.isIncubator() || $scope.isSavi()) {
                // add the maximum hours in use 4 testers, savi or incubator colleagues : 
                var statusdateplus = moment(statusdate).add(maxHoursInUse4TIS, 'h');

                // derive statusdate with time eq 19:00:00 PM :
                var hourEoB = parseInt(CONFIG.EODTIMEHHMMSS.substr(0, 2));
                var minuteEoB = parseInt(CONFIG.EODTIMEHHMMSS.substr(2, 2));
                var secondEoB = parseInt(CONFIG.EODTIMEHHMMSS.substr(4, 2));

                var statusdateEOB = moment(statusdate)
                    .set({ hour: hourEoB, minute: minuteEoB, second: secondEoB })
                    .toDate();

                // compare statusdateplus with now (= actual datetime) .. 
                // if now > statusdateplus or now > statusdateEOB then return true else false :
                return moment().isAfter(statusdateplus) || moment().isAfter(statusdateEOB);
            }
        }

        // return false as default!                         
        return false;
    };

    $scope.formatStatus = function(status) {
        return status == DEVSTATUS.INUSE ? 'in use' : status;
    };

    $scope.deviceIsFree = function(device) {
        return (device.statusobject.status != DEVSTATUS.INUSE && 
                device.statusobject.status != DEVSTATUS.LOCKED &&
                device.statusobject.status != DEVSTATUS.DELETED);
    }

    $scope.open = function(p, size) {
        var modalInstance = $modal.open({
            templateUrl: 'partials/devicesEdit.html',
            controller: 'deviceEditCtrl',
            size: size,
            resolve: {
                item: function() {
                    return p;
                }
            }
        });
        modalInstance.result.then(function(selectedObject) {
            if (selectedObject) {
                p.boxid = selectedObject.boxid;
                p.brand = selectedObject.brand;
                p.model = selectedObject.model;
                p.os = selectedObject.os;
                p.osversion = selectedObject.osversion;
                p.screensize = selectedObject.screensize;
                p.type = selectedObject.type;
                p.profile = selectedObject.profile;
                p.location = selectedObject.location;
                p.wifiid = selectedObject.wifiid;
                p.wifipassword = selectedObject.wifipassword;
                p.comments = selectedObject.comments;
                p.badgeid = selectedObject.badgeid;
                p.imei = selectedObject.imei;
                p.serialnumber = selectedObject.serialnumber;
            }
        });
    };

    $scope.clearFilters = function() {
        $scope.filters = {};
    };

    $scope.deleteDevice = function(device, size) {

        // !! deleting a device is a logical delete where the (device) status will become deleted .. 

        var modalInstance = $modal.open({
            templateUrl: 'partials/deviceDelete.html',
            controller: 'deviceDeleteCtrl',
            size: size,
            resolve: {
                item: function() {
                    return device;
                }
            }
        });
        modalInstance.result.then(function(selectedObject) {
            if (selectedObject) {
                // update the 'model' : .. //TODO:
                
            }
        });
    };

    /*
    $scope.deleteDevice = function(device) {
        
        if (!confirm('Are you sure to remove the device ' + device.boxid + ' ?')) 
            return;

        if (device && device.statusobject && device.statusobject.status == DEVSTATUS.AVAILABLE) {
            // !! deleting a device is a logical delete where the (device) status will become deleted ..    
            var deleteRequest = { id: device.id, statusobject: { status: DEVSTATUS.DELETED, userobject: null } };

            // call the (VT) service to DELETE the concerned device ..
            Data.post('device/status' + '?token=' + sessionStorage.userToken, deleteRequest).then(function(data) {
                if (!data) {
                    toastr.error(MESSAGES.SERVICENOK);
                    return;
                }

                if (!data.error) {
                    // update the local 'model' ..
                    device.statusobject = { status: DEVSTATUS.DELETED, userobject: null };
                    toastr.info('Device ' + device.boxid + '   ' + device.brand + ' ' + device.model + ' was "deleted" !');
                } else
                    toastr.warning('Technical problem with "deleting" device ' + device.boxid + Common.GetErrorMessage(ENVIRONMENT.DEBUG, data.error));
            });
        };
    };
    */

    $scope.returnDevice = function(device) {

        if (device && device.statusobject && device.statusobject.status == DEVSTATUS.INUSE) {

            var returnRequest = { id: device.id, statusobject: { status: DEVSTATUS.AVAILABLE, userobject: null } };

            /* call the (VT) service to RETURN the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, returnRequest).then(function(data) {
                if (!data) {
                    toastr.error(MESSAGES.SERVICENOK);
                    return;
                }

                if (!data.error) {
                    /* update the local 'model' .. */
                    device.statusobject = { status: DEVSTATUS.AVAILABLE, userobject: null };
                    toastr.info('Device ' + device.boxid + '   ' + device.brand + ' ' + device.model + ' was "returned" !');
                } else
                    toastr.warning('Technical problem with "returning" device ' + device.boxid + Common.GetErrorMessage(ENVIRONMENT.DEBUG, data.error));
            });
        };
    };

    $scope.unlockDevice = function(device) {

        if (device && device.statusobject && device.statusobject.status == DEVSTATUS.LOCKED) {

            var unlockRequest = { id: device.id, statusobject: { status: DEVSTATUS.AVAILABLE, userobject: null } };

            /* call the (VT) service to UNLOCK the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, unlockRequest).then(function(data) {
                if (!data) {
                    toastr.error(MESSAGES.SERVICENOK);
                    return;
                }

                if (!data.error) {
                    /* update the local 'model' .. */
                    device.statusobject = { status: DEVSTATUS.AVAILABLE, userobject: null };
                    toastr.info('Device ' + device.boxid + '   ' + device.brand + ' ' + device.model + ' was "unlocked" !');
                } else
                    toastr.warning('Technical problem with "unlocking" device ' + device.boxid + Common.GetErrorMessage(ENVIRONMENT.DEBUG, data.error));
            });
        };
    };

    $scope.confirmDevice = function(device) {

        if (device && device.statusobject && device.statusobject.status == DEVSTATUS.LOCKED) {

            // alert($scope.currentuser.userid);
            var confirmRequest = { id: device.id, statusobject: { status: DEVSTATUS.INUSE, userobject: { userid: $scope.currentuser.userid } } };

            /* call the (VT) service to CONFIRM the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, confirmRequest).then(function(data) {
                if (!data) {
                    toastr.error(MESSAGES.SERVICENOK);
                    return;
                }

                if (!data.error) {
                    /* update the local 'model' .. */
                    device.statusobject = { status: DEVSTATUS.INUSE, userobject: { fullname: $scope.currentuser.fullname, userid: $scope.currentuser.userid } };
                    toastr.info('Device ' + device.boxid + '   ' + device.brand + ' ' + device.model + ' was "confirmed" !');
                } else
                    toastr.warning('Technical problem with "confirming" device ' + device.boxid + Common.GetErrorMessage(ENVIRONMENT.DEBUG, data.error));
            });
        };
    };

    $scope.lockDevice = function(device) {

        if (device && device.statusobject && device.statusobject.status == DEVSTATUS.AVAILABLE) {
            var lockRequest = { id: device.id, statusobject: { status: DEVSTATUS.LOCKED, userobject: { userid: $scope.currentuser.userid } } };

            /* call the (VT) service to LOCK the concerned device .. */
            Data.post('device/status' + '?token=' + sessionStorage.userToken, lockRequest).then(function(data) {
                if (!data) {
                    toastr.error(MESSAGES.SERVICENOK);
                    return;
                }

                if (!data.error) {
                    /* update the local 'model' .. */
                    device.statusobject = { status: DEVSTATUS.LOCKED, userobject: { fullname: $scope.currentuser.fullname, userid: $scope.currentuser.userid } };
                    toastr.info('Device ' + device.boxid + '   ' + device.brand + ' ' + device.model + ' was "locked" !');
                } else
                    toastr.warning('Technical problem with "locking" device ' + device.boxid + Common.GetErrorMessage(ENVIRONMENT.DEBUG, data.error));
            });
        };
    };
});
