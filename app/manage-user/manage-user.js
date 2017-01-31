appCtrls.controller('ListUserCtrl', function ($scope, rootSvc, webSvc, localDbSvc) {
    rootSvc.SetPageTitle('List User');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Users");
    $scope.AuthToken = localDbSvc.getToken();
    var BindUserList = function () {
        webSvc.getUsers($scope.pageSize, $scope.pageIndex, $scope.Sc, $scope.So).success(function(data){
            if (data.status.code == 0) {
                $scope.UserList = data.response;
                angular.forEach(data.response, function (val, key) {
                    angular.forEach(val.roles, function (subVal, k) {
                        if (k != 0)
                            val.roles = val.roles + ", " + subVal;
                        else
                            val.roles = subVal;
                    })
                })
                $scope.UserList.totalCount = data.totalCount;
            }
        });
    }
    $scope.Init = function () {
        $scope.PageSize = '20';
        $scope.PageIndex = 1;
        $scope.So = "asc";
        $scope.Sc = "userName";
        BindUserList();
    }
    $scope.PageSizeChanged = function () {
        BindUserList();
    }
    $scope.PageChanged = function (page) {
        $scope.PageIndex = page;
        BindUserList();
    }
    $scope.Sorting = function (expression) {
        $scope.So = $scope.So == "asc" ? "desc" : "asc";
        $scope.Sc = expression;
        BindUserList();
    }

    $scope.confirm = function (userId) {
        $scope.UserIdToDeleteUser = userId;
        $("#confirmModel").modal("show");
    }

    $scope.DeleteUser = function () {
        $("#confirmModel").modal("hide");
        webSvc.deleteUser($scope.UserIdToDeleteUser).success(function(data){
            if (data.status.code == 0) {
                toastr.success("User deleted successfully")
                BindUserList();
            } else {
                toastr.success(data.status.message);
            }
        });
    }

});

appCtrls.controller('AddUserCtrl', function ($scope, rootSvc, webSvc, localDbSvc, $state, $filter, $modal, $rootScope) {
    rootSvc.SetPageTitle('Add User');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Users");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.InternalCompany = localDbSvc.get("InternalCompany");
    $scope.Action = "Add";
    $scope.AddUser = true;
    var BindRoles = function () {
        webSvc.getRoles().success(function(data){
            if (data.status.code == 0) {
                $scope.RoleList = data.response;
            }
        });
    }


    var BindLanguages = function () {
        webSvc.getLanguages().success(function(data){
            if (data.status.code == 0) {
                $scope.LanguageList = data.response;
            }
        });
    }


    var BindTimezones = function () {
        webSvc.getTimeZones().success(function(data){
            if (data.status.code == 0) {
                $scope.TimezoneList = data.response;
            }
        });
    }

    var BindDeviceGroups = function () {
        webSvc.getDeviceGroups().success(function(data){
            if (data.status.code == 0) {
                $scope.DeviceGroupList = data.response;
            }
        });
    }

    $scope.Init = function () {
        BindRoles();
        BindLanguages();
        BindTimezones();
        BindDeviceGroups();
        $scope.User = {};
        $scope.User.user = {};
        $scope.User.user.temperatureUnits = "Celsius";
        $scope.User.user.measurementUnits = "Metric";
        $scope.User.user.language = "English";
        $scope.User.user.timeZone = "Antarctica/Casey";
        $scope.User.user.external = false;
        $scope.User.resetOnLogin = false;
        $scope.User.user.active = true;
        if ($scope.InternalCompany)
            $scope.User.user.externalCompany = $scope.InternalCompany;
    }

    $scope.$watch("User.user.external", function (nVal, oVal) {
        if ($scope.User && $scope.User.user) {
            if (!nVal) {
                $scope.User.user.externalCompany = $scope.InternalCompany
            }
            else {
                $scope.User.user.externalCompany = $scope.externalCompany;
            }
        }
    })

    $scope.SaveData = function (isValid) {
        if (isValid) {
            webSvc.saveUser($scope.User).success( function (data, textStatus, XmlHttpRequest) {
                toastr.success("User added successfully");
                $state.go('manage.user');
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });
        }
    }
});

appCtrls.controller('EditUserCtrl', function ($scope, rootSvc, webSvc, localDbSvc, $stateParams, $state, $filter, $rootScope) {
    rootSvc.SetPageTitle('Edit User');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Users");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.Action = "Edit";
    $scope.AddUser = false;
    var BindRoles = function () {
        webSvc.getRoles().success(function(data){
            console.log("TEST", data);
        // .get({ action: "getRoles", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.RoleList = data.response;
            }
        });
    }


    var BindLanguages = function () {
        webSvc.getLanguages().success(function(data){
        // .get({ action: "getLanguages", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.LanguageList = data.response;
            }
        });
    }


    var BindTimezones = function () {
        webSvc.getTimeZones().success(function(data){
        // .get({ action: "getTimeZones ", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.TimezoneList = data.response;
            }
        });
    }

    var BindDeviceGroups = function () {
        webSvc.getDeviceGroups().success(function(data){
        // .get({ action: "getDeviceGroups ", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.DeviceGroupList = data.response;
            }
        });
    }

    BindRoles();
    BindLanguages();
    BindTimezones();
    BindDeviceGroups();
    $scope.Init = function () {

        $scope.UId = $stateParams.uId;
        console.log($scope.UId);
        $scope.User = {};
        if ($scope.UId) {

            var param = {
                userId: $scope.UId
            };
            webSvc.getUser(param).success(function(data){
                // console.log("TEST", data);
                // .get({ action: "getUser", token: $scope.AuthToken, userId: $scope.UId }, function (data) {
                if (data.status.code == 0) {
                    $scope.User = {};
                    $scope.User.user = data.response;
                    $scope.externalCompany = data.response.externalCompany;
                    console.log($scope.User.user)
                }
            });


            //$scope.$watch("User.user.external", function (nVal, oVal) {
            //    if (nVal) {
            //        $scope.User.user.company = "";
            //    }
            //    else {
            //        $scope.User.user.company = $scope.User.user.internalCompany;
            //    }
            //})

        }
    }

    $scope.$watch("User.user.external", function (nVal, oVal) {
        if ($scope.User && $scope.User.user) {
            if (!nVal) {
                $scope.User.user.externalCompany = $scope.User.user.internalCompany
            }
            else {
                $scope.User.user.externalCompany = $scope.externalCompany;
            }
        }
    })

    $scope.SaveData = function (isValid) {
        if (isValid) {
            webSvc.saveUser($scope.User).success( function (data, textStatus, XmlHttpRequest) {
                toastr.success("User updated successfully")
                $state.go('manage.user')
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });
        }
    }
});