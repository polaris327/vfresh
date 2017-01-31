appCtrls.controller('ListNotiCtrl', function ($scope, rootSvc, localDbSvc, webSvc) {
    rootSvc.SetPageTitle('List Notification');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Notifications Schedules");
    var BindNotificationList = function () {
        webSvc.getNotificationSchedules($scope.pageSize, $scope.pageIndex, $scope.Sc, $scope.So).success(function(data){
            
            if (data.status.code == 0) {
                $scope.NotificationList = data.response;
                $scope.NotificationList.totalCount = data.totalCount;
            }
        });
    }
    $scope.PageChanged = function (page) {
        $scope.PageIndex = page;
        BindNotificationList();
    }
    $scope.PageSizeChanged = function () {
        BindNotificationList();
    }
    $scope.Init = function () {
        $scope.PageSize = '20';
        $scope.PageIndex = 1;
        $scope.So = "asc";
        $scope.Sc = "notificationScheduleName";
        BindNotificationList();
    }
    $scope.Sorting = function (expression) {
        $scope.So = $scope.So == "asc" ? "desc" : "asc";
        $scope.Sc = expression;
        BindNotificationList();
    }

    $scope.confirm = function (notificationId) {
        $scope.NotificationToDeleteNotificationSchedule = notificationId;
        $("#confirmModel").modal("show");
    }

    $scope.DeleteNotification = function () {
        $("#confirmModel").modal("hide");
        webSvc.deleteNotificationSchedule($scope.NotificationToDeleteNotificationSchedule).success(function(data){
            if (data.status.code == 0) {
                toastr.success("Notification schedule deleted successfully");
                BindNotificationList();
            }
        });
    }
});

appCtrls.controller('AddNotiCtrl', function ($scope, rootSvc, localDbSvc, $state, $rootScope, $timeout, $filter, webSvc) {

    if (!$rootScope.modalInstance) {
        rootSvc.SetPageTitle('Add Notification');
        rootSvc.SetActiveMenu('Setup');
        rootSvc.SetPageHeader("Notifications Schedules");
    }
    else {
        $scope.PageTitle = 'Add Notification';
        $scope.ActiveMenu = 'Setup';
        $scope.PageHeader = "Notifications Schedules";
    }

    $scope.daysSelection = [true, false, false, false, false, false, false];
    $scope.Noti = {};
    $scope.Noti.schedules = [];
    $scope.Action = "Add";

    $scope.AuthToken = localDbSvc.getToken();

    if ($rootScope.modalInstance) {
        $scope.fromModalPopup = true;
    }
    $scope.close = function () {
        if (confirm("Any unsaved changes will be lost including delete, are you sure you want to cancel?")) {
            $rootScope.modalInstance.dismiss('cancel');
        }
    }

    $scope.CheckToTime = function (person, index) {
        if (person.fromTime == '08:00' && person.toTime == '17:59') {
            person.allHours = false;
            person.bizHours = true;
        }
        else if (person.fromTime == '00:00' && person.toTime == '23:59') {
            person.allHours = true;
            person.bizHours = false;
        }
        else {
            person.allHours = false;
            person.bizHours = false;
        }
        var name = "valToTime" + index
        if (Date.parse('01/01/2011 ' + person.fromTime) > Date.parse('01/01/2011 ' + person.toTime)) {
            $scope.frmGenAddEditNoti[name].$setValidity("toTime", false);
        }
        else {
            $scope.frmGenAddEditNoti[name].$setValidity("toTime", true);
        }
    }

    $scope.CheckFromTime = function (person, index) {
        if (person.fromTime == '08:00' && person.toTime == '17:59') {
            person.allHours = false;
            person.bizHours = true;
        }
        else if (person.fromTime == '00:00' && person.toTime == '23:59') {
            person.allHours = true;
            person.bizHours = false;
        }
        else {
            person.allHours = false;
            person.bizHours = false;
        }
        var name = "valToTime" + index
        if (Date.parse('01/01/2011 ' + person.fromTime) > Date.parse('01/01/2011 ' + person.toTime)) {
            $scope.frmGenAddEditNoti[name].$setValidity("toTime", false);
        }
        else {
            $scope.frmGenAddEditNoti[name].$setValidity("toTime", true);
        }
    }

    $scope.Init = function () {
        if ($rootScope.modalInstance) {
            $rootScope.modalInstance.opened.then(function () {
                $timeout(function () {
                    $("div.modal-dialog").addClass("modal-lg").attr("style", "width:90%");
                }, 300);
            })
        }

        webSvc.listUsers(1000000, 1, "fullName", "asc").success(function(data){
            if (data.status.code == 0) {
                $scope.UserList = data.response;
            }
        });
    }


    $scope.GetSelectedUserPositionCompany = function (person) {
        var selectedUser = $filter('filter')($scope.UserList, { id: person.userId }, true)[0];
        person.selectedUserPositionCompany = selectedUser.positionCompany;
    }


    $scope.SelectHour = function (filter, $event, person, index) {
        var name = "valToTime" + index;
        $scope.frmGenAddEditNoti[name].$setValidity("toTime", true);
        switch (filter) {
            case "all":
                person.fromTime = '00:00';
                person.toTime = '23:59';
                person.allHours = true;
                person.bizHours = false;
                break;
            case "biz":
                person.fromTime = '08:00';
                person.toTime = '17:59';
                person.allHours = false;
                person.bizHours = true;
                break;
        }
    }

    $scope.SaveNoti = function (isValid, closeModalPopUp) {

        if (isValid) {    
            webSvc.saveNotificationSchedule($scope.Noti).success( function (data, textStatus, XmlHttpRequest) {
                toastr.success("Notification added successfully")
                if (closeModalPopUp) {
                    $rootScope.modalInstance.close('cancel');
                    $scope.fromModalPopup = false;
                }
                else {
                    $state.go('manage.noti')
                }

            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });
        }
    }
    $scope.AddPerson = function () {
        $scope.Noti.schedules.push({
            userId: "",
            sendEmail: true,
            sendSms: false,
            toTime: '17:59',
            fromTime: '08:00',
            sendApp: true,
            weekDays: [true, true, true, true, true, true, true],
            afterHours: false,
            bizHours: true,
            allHours: false,
            selection: "all"
        })
    }
    $scope.AddPerson();
    $scope.DeletePerson = function (schedule) {
        if ($scope.Noti.schedules.length > 1) {
            var index = $scope.Noti.schedules.indexOf(schedule);
            $scope.Noti.schedules.splice(index, 1);
        }
    }

    $scope.WarnUserAndRedirect = function () {
        $("#confirmModel").modal("hide");
        setTimeout(function () {
            $state.go('manage.noti')
        }, 200)
    }
});

appCtrls.controller('EditNotiCtrl', function ($scope, webSvc, rootSvc, localDbSvc, $stateParams, $state, $rootScope, $timeout, $filter) {
    if (!$rootScope.modalInstance) {
        rootSvc.SetPageTitle('Edit Notification');
        rootSvc.SetActiveMenu('Setup');
        rootSvc.SetPageHeader("Notifications Schedules");
    }
    else {
        $scope.PageTitle = 'Edit Notification';
        $scope.ActiveMenu = 'Setup';
        $scope.PageHeader = "Notifications Schedules";
    }
    $scope.Action = "Edit";
    $scope.AuthToken = localDbSvc.getToken();
    
    if ($rootScope.modalInstance) {
        $scope.fromModalPopup = true;
    }
    $scope.close = function () {
        if (confirm("Any unsaved changes will be lost including delete, are you sure you want to cancel?")) {
            $rootScope.modalInstance.dismiss('cancel');
        }
    }
    $scope.WarnUserAndRedirect = function () {
        $("#confirmModel").modal("hide");
        setTimeout(function () {
            $state.go('manage.noti')
        }, 200)
    }
    $scope.Init = function () {
        if ($rootScope.modalInstance) {
            $rootScope.modalInstance.opened.then(function () {
                $timeout(function () {
                    $("div.modal-dialog").addClass("modal-lg").attr("style", "width:90%");
                }, 300);
            })
        }
    }

    $scope.GetSelectedUserPositionCompany = function (person) {
        var selectedUser = $filter('filter')($scope.UserList, { id: person.userId }, true)[0];
        if(selectedUser != undefined){
            person.selectedUserPositionCompany = selectedUser.positionCompany;
        }
    }
    $scope.SelectHour = function (filter, $event, person, index) {
        var name = "valToTime" + index;
        if ($scope.frmGenAddEditNoti)
            $scope.frmGenAddEditNoti[name].$setValidity("toTime", true);
        switch (filter) {
            case "all":
                person.fromTime = '00:00';
                person.toTime = '23:59';
                person.allHours = true;
                person.bizHours = false;
                break;
            case "biz":
                person.fromTime = '08:00';
                person.toTime = '17:59';
                person.allHours = false;
                person.bizHours = true;
                break;
        }
    }

    $scope.scheduleNotificationId = $stateParams.nId
    if ($scope.scheduleNotificationId || $rootScope.notiIdForModalPopup) {
        var notiId;
        if ($scope.scheduleNotificationId)
            notiId = $scope.scheduleNotificationId;
        else
            notiId = $rootScope.notiIdForModalPopup;

    }

    $scope.AddPerson = function () {
        $scope.Noti.schedules.push({
            userId: "",
            sendEmail: true,
            sendSms: false,
            toTime: '17:59',
            fromTime: '08:00',
            sendApp: true,
            weekDays: [true, true, true, true, true, true, true],
            afterHours: false,
            bizHours: true,
            allHours: false
        })
    }
    $scope.SaveNoti = function (isValid, closeModalPopup) {
        if (isValid) {
            webSvc.saveNotificationSchedule($scope.Noti).success( function (data, textStatus, XmlHttpRequest) {
                toastr.success("Notification updated successfully")
                if (closeModalPopup) {
                    $scope.fromModalPopup = false;
                    $rootScope.modalInstance.close('cancel');
                }
                else {
                    $state.go('manage.noti')
                }
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });
        }
    }

    $scope.CheckToTime = function (person, index) {
        if (person.fromTime == '08:00' && person.toTime == '17:59') {
            person.allHours = false;
            person.bizHours = true;
        }
        else if (person.fromTime == '00:00' && person.toTime == '23:59') {
            person.allHours = true;
            person.bizHours = false;
        }
        else {
            person.allHours = false;
            person.bizHours = false;
        }
        var name = "valToTime" + index
        if (Date.parse('01/01/2011 ' + person.fromTime) > Date.parse('01/01/2011 ' + person.toTime)) {
            $scope.frmGenAddEditNoti[name].$setValidity("toTime", false);
        }
        else {
            $scope.frmGenAddEditNoti[name].$setValidity("toTime", true);
        }
    }

    $scope.CheckFromTime = function (person, index) {
        if (person.fromTime == '08:00' && person.toTime == '17:59') {
            person.allHours = false;
            person.bizHours = true;
        }
        else if (person.fromTime == '00:00' && person.toTime == '23:59') {
            person.allHours = true;
            person.bizHours = false;
        }
        else {
            person.allHours = false;
            person.bizHours = false;
        }
        var name = "valToTime" + index
        if (Date.parse('01/01/2011 ' + person.fromTime) > Date.parse('01/01/2011 ' + person.toTime)) {
            $scope.frmGenAddEditNoti[name].$setValidity("toTime", false);
        }
        else {
            $scope.frmGenAddEditNoti[name].$setValidity("toTime", true);
        }
    }

    angular.element(document).ready(function () {

        webSvc.getNotificationSchedule(notiId).success(function(data){
            if (data.status.code == 0) {
                $scope.Noti = data.response;
                if (data.response.schedules.length == 0) {
                    $scope.Noti.schedules.push({
                        userId: "",
                        sendEmail: true,
                        sendSms: false,
                        toTime: '17:59',
                        fromTime: '08:00',
                        sendApp: true,
                        weekDays: [true, true, true, true, true, true, true],
                        afterHours: false,
                        bizHours: true,
                        allHours: false
                    })
                }
                else {
                    angular.forEach($scope.Noti.schedules, function (val, key) {
                        if (val.toTime == '07:59' && val.fromTime == '19:00') {
                            val["bizHours"] = false;
                            val["allHours"] = false;
                            val["afterHours"] = true;
                        }
                        else if (val.toTime == '23:59' && val.fromTime == '00:00') {
                            val["allHours"] = true;
                            val["afterHours"] = false;
                            val["bizHours"] = false;
                        }
                        else if (val.toTime == '17:59' && val.fromTime == '08:00') {
                            val["afterHours"] = false;
                            val["bizHours"] = true;
                            val["allHours"] = false;
                        }

                        if (val.weekDays[0] && val.weekDays[1] && val.weekDays[2] && val.weekDays[3] && val.weekDays[4] && val.weekDays[5] && val.weekDays[6]) {
                            val["selection"] = "all"
                        }
                        else if (!val.weekDays[0] && !val.weekDays[1] && !val.weekDays[2] && !val.weekDays[3] && !val.weekDays[4] && val.weekDays[5] && val.weekDays[6]) {
                            val["selection"] = "we"
                        }
                        else if (val.weekDays[0] && val.weekDays[1] && val.weekDays[2] && val.weekDays[3] && val.weekDays[4] && !val.weekDays[5] && !val.weekDays[6]) {
                            val["selection"] = "wd"
                        }
                    })
                }


                webSvc.listUsers(1000000, 1, "fullName", "asc").success(function(data){
                    if (data.status.code == 0) {
                        $scope.UserList = data.response;
                        angular.forEach($scope.Noti.schedules, function (val, key) {
                            $scope.GetSelectedUserPositionCompany(val)
                        });
                    }
                });
            }
        });
    });

    $scope.DeletePerson = function (schedule) {
        if ($scope.Noti.schedules.length > 1) {
            var index = $scope.Noti.schedules.indexOf(schedule);
            $scope.Noti.schedules.splice(index, 1);
        }
    }
});