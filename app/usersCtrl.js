app.controller('usersCtrl', function ($scope, $modal, $filter, Data) {
    /* todo: get the current user identifier : */
    $scope.currentuser = { id : 98765, profile : 'administrator', fullname : 'Anthony Franssens'};

    $scope.users = {};
    /* todo: activate the 'data' factory :
    Data.get('users').then(function(data){
        $scope.users = data.data;
    });
    */
    /* todo: update the list of users with the other missing fields as : IMEI, SerialNbr, Password (?), ... */
    $scope.users = [{ id : 98765, badgeid : '1011001', fullname : 'Anthony Franssens', firstname : 'Anthony', lastname : 'Franssens', profile : 'administrator', startdate : '01/09/2016', enddate : null, counterlocked : 0, counterinuse : 1 },
                    { id : 6789, badgeid : '1011110', fullname : 'Marc Vermeir', firstname : 'Marc', lastname : 'Vermeir', profile : 'tester', startdate : '01/09/2016', enddate : null, counterlocked : 1, counterinuse : 1 },
                    { id : 12345, badgeid : '1011111', fullname : 'Marwan Bellouti', firstname : 'Marwan', lastname : 'Bellouti', profile : 'tester', startdate : '01/09/2016', enddate : null, counterlocked : 1, counterinuse : 0 },
                    ];


    $scope.deleteUser = function(user){
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
    
    $scope.columns = [ {text:"Badgeid",predicate:"badgeid",sortable:true,dataType:"number"},
                       {text:"Name",predicate:"fullname",sortable:true},
                       {text:"Profile",predicate:"profile",sortable:true},
                       {text:"Enddate",predicate:"enddate",sortable:true},
                       {text:"#Devices Locked",predicate:"counterlocked",sortable:true},
                       {text:"#Devices InUse",predicate:"counterinuse",sortable:true},
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