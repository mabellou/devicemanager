app.factory("Data", ['$http', '$location',
    function ($http, $q, $location) {

        var serviceBase = 'https://devicerestnodejsv1.herokuapp.com/private/api/v1/';

        var obj = {};

        obj.get = function (q) {
            return $http.get(serviceBase + q)
                .then(function (results) {
                    return results.data;
                })
                .catch(function (results) {
                    console.log('Error in http get ' + q + ' //' + results.data);
                    return null;
                });
        };

        obj.post = function (q, object) {
            // authentication should be done via the public service operation
            var serviceUrl = serviceBase + q;
            if (q == 'authenticate') {
                serviceUrl = serviceUrl.replace('/private', '');   
            }

            return $http.post(serviceUrl, object)
                .then(function (results) {
                    if (results.status == 200)
                        return results.data || results.status;
                    else
                        return null;
                })
                .catch(function (results) {
                    console.log('Error in http post ' + q + ' //' + results.data);
                    return null;
                });
        };

        obj.put = function (q, object) {
            return $http.put(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };

        obj.delete = function (q) {
            return $http.delete(serviceBase + q).then(function (results) {
                return results.data;
            });
        };
        
        return obj;
}]);
