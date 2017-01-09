app.factory("Common", ['DEVTYPE', 'USRPROFILE',
    function(DEVTYPE, USRPROFILE) {

        var obj = {};

        obj.GetErrorMessage = function(isDebug, dataError) {
            return isDebug ? '   [' + dataError.text + ']' : '';
        };

        obj.GetDeviceTypes = function() {
          return  [ { id: DEVTYPE.SMARTPHONE, name: DEVTYPE.SMARTPHONE },
                    { id: DEVTYPE.TABLET, name: DEVTYPE.TABLET },
                  ];
        };

        obj.GetProfiles = function() {  
        return  [ { id: USRPROFILE.ADMINISTRATOR, name: USRPROFILE.ADMINISTRATOR },
                  { id: USRPROFILE.TESTER, name: USRPROFILE.TESTER },
                  { id: USRPROFILE.INCUBATOR, name: USRPROFILE.INCUBATOR },
                  { id: USRPROFILE.SAVI, name: USRPROFILE.SAVI },
                  { id: USRPROFILE.BUSINESS, name: USRPROFILE.BUSINESS },
                ];
        };

        return obj;
    }
]);
