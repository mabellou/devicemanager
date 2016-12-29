app.factory("Common", [
    function() {

        var obj = {};

        obj.GetErrorMessage = function(isDebug, dataError) {
            return isDebug ? '   [' + dataError.text + ']' : '';
        };

        return obj;
    }
]);
