app.controller('usersCtrl', function ($scope, $modal, $filter, Data, $location) {
    
    /* todo: get username & password from authentication form .. */
    /* $scope.currentuser = { id : 98765, profile : 'administrator', fullname : 'Anthony Franssens'}; */
    var credentials = { username : 'marcvermeir', password : 'azerty' };

    $scope.currentuser = {};
    /* authenticate the 'current user' ?! .. */ 
    if (!sessionStorage.userToken)
        Data.post('authenticate', credentials).then(function(data) {
                        sessionStorage.userToken = data.token;
                        sessionStorage.userId = data.userid;
        });

        /* quid error(s) returned ? */

    /* get the user info of the 'current user' .. */
    if (!sessionStorage.userToken)
        $location.path('/login');
    else {
        /* call the (VT) Service to fetch the 'current user' info .. */
        Data.get('user/' + sessionStorage.userId + '?token=' + sessionStorage.userToken).then(function(data) {
            /* capture the user data into a $scope.currentuser object .. */
            $scope.currentuser = { userid : data.id, fullname : data.fullname, profile : data.profile };
        });
        /* quid error(s) returned ? */
    }

    /* get the list of all VT users */
    $scope.users = {};

    Data.get('users').then(function(data){
        $scope.users = data;
    });

    /* 
    $scope.users = [{ id : 98765, badgeid : '1011001', fullname : 'Anthony Franssens', firstname : 'Anthony', lastname : 'Franssens', profile : 'administrator', startdate : '01/09/2016', enddate : null, counterlocked : 0, counterinuse : 1 },
                    { id : 6789, badgeid : '1011110', fullname : 'Marc Vermeir', firstname : 'Marc', lastname : 'Vermeir', profile : 'tester', startdate : '01/09/2016', enddate : null, counterlocked : 1, counterinuse : 1 },
                    { id : 12345, badgeid : '1011111', fullname : 'Marwan Bellouti', firstname : 'Marwan', lastname : 'Bellouti', profile : 'tester', startdate : '01/09/2016', enddate : null, counterlocked : 1, counterinuse : 0 },
                    ];
    */

    $scope.deleteUser = function(user) {
        /* todo: delete user should be a logical delete where the enddate will be set equal to today */
        if(confirm("Are you sure to remove the user")){
            Data.delete("users/"+user.badgeid).then(function(result){
                $scope.users = _.without($scope.users, _.findWhere($scope.users, {badgeid:user.badgeid}));
            });
        }
    };

    $scope.open = function (p,size) {
        var modalInstance = $modal.open({
          templateUrl: 'partials/usersEdit.html',
          controller: 'userEditCtrl',
          size: size,
          resolve: {
            item: function () {
              return p;
            }
          }
        });
        modalInstance.result.then(function(selectedObject) {
                p.badgeid = selectedObject.badgeid;
                p.name = selectedObject.name;
                p.lastlogged = selectedObject.lastlogged;
        });
    };

    $scope.create = function (p,size) {
        var modalInstance = $modal.open({
          templateUrl: 'partials/usersEdit.html',
          controller: 'userCreateCtrl',
          size: size,
          resolve: {
            item: function () {
              return p;
            }
          }
        });
        modalInstance.result.then(function(selectedObject) {
                delete selectedObject.save;
                delete selectedObject.id;
                $scope.users.push(selectedObject);
                $scope.users = $filter('orderBy')($scope.users, 'badgeid', 'reserve');
        });
    };
    
    $scope.getClass = function(date) {
        return 'info';
        /* todo: class value should be 'danger' if date (dd/mm/yyyy) < currentdate, otherwise return 'info'
        return {'info': date - today <= 0, 'danger': (date - today > 0 && date - today <= 3)};
        */
    };

    $scope.columns = [ {text:"Badge ID",predicate:"badgeid",sortable:true,dataType:"number"},
                       {text:"Name",predicate:"fullname",sortable:true},
                       {text:"Profile",predicate:"profile",sortable:true},
                       {text:"Active Until",predicate:"enddate",sortable:true},
                       {text:"#Devices Locked",predicate:"counterlocked",sortable:true,dataType:"number"},
                       {text:"#Devices In Use",predicate:"counterinuse",sortable:true,dataType:"number"},
                       {text:"Action",predicate:"",sortable:false}
                     ];

});

app.controller('userEditCtrl', function ($scope, $modalInstance, item, Data) {

  $scope.user = angular.copy(item);
        
        $scope.cancel = function () {
            $modalInstance.dismiss('Close');
        };
        $scope.title = 'Edit User' ;
        $scope.buttonText = 'Update User';

        var original = item;
        $scope.isClean = function() {
            return angular.equals(original, $scope.user);
        }
        $scope.saveUser = function (user) {
                Data.put('users/'+user.badgeid, user).then(function (result) {
                    if(result.status != 'error'){
                        var x = angular.copy(user);
                        x.save = 'update';
                        $modalInstance.close(x);
                    }else{
                        console.log(result);
                    }
                });
        };
});

app.controller('userCreateCtrl', function ($scope, $modalInstance, item, Data) {

  $scope.user = angular.copy(item);
        
        $scope.cancel = function () {
            $modalInstance.dismiss('Close');
        };
        $scope.title = 'Add User';
        $scope.buttonText = 'Add New User';

        var original = item;
        $scope.isClean = function() {
            return angular.equals(original, $scope.user);
        }
        $scope.saveUser = function (user) {
                Data.post('users', user).then(function (result) {
                    if(result.status != 'error'){
                        var x = angular.copy(user);
                        x.save = 'insert';
                        x.id = result.data;
                        $modalInstance.close(x);
                    }else{
                        console.log(result);
                    }
                });
        };
});