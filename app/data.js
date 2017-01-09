app.factory("Data", ['$http', '$location',
    function($http, $q, $location) {

        var serviceBase = 'https://devicerestnodejsv1.herokuapp.com/private/api/v1/';

        var obj = {};

        obj.get = function(q) {
            var serviceUrl = serviceBase + q;

            return $http.get(serviceUrl)
                .then(function(results) {
                    return results.data;
                })
                .catch(function(results) {
                    console.log('Error in http get ' + q + ' //' + results.data);
                    return null;
                });
        };

        obj.post = function(q, object) {
            var serviceUrl = serviceBase + q;

            // authentication should be done via the public service operation
            if (q == 'authenticate') {
                serviceUrl = serviceUrl.replace('/private', '');
            }

            return $http.post(serviceUrl, object)
                .then(function(results) {
                    if (results.status == 200)
                        return results.data || results.status;
                    else
                        return null;
                })
                .catch(function(results) {
                    console.log('Error in http post ' + q + ' //' + results.data);
                    return null;
                });
        };

        obj.put = function(q, object) {
            var serviceUrl = serviceBase + q;

            return $http.put(serviceUrl, object)
                .then(function(results) {
                    //todo: check if status == 200 ?! ..
                    return results.data;
                })
                .catch(function(results) {
                    console.log('Error in http put ' + q + ' //' + results.data);
                    return null;
                });
        };

        obj.delete = function(q) {
            var serviceUrl = serviceBase + q;

            return $http.delete(serviceUrl).then(function(results) {
                return results.data;
            });
        };

        return obj;
    }
]);
