appCtrls.controller('ListAutoTempCtrl', function ($scope, rootSvc, localDbSvc, webSvc) {
    rootSvc.SetPageTitle('List Shipment Template');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Shipment Templates");
    $scope.AuthToken = localDbSvc.getToken();
    var BindShipmentList = function () {
        var param = {
            pageSize: $scope.PageSize, 
            pageIndex: $scope.PageIndex, 
            so: $scope.So, 
            sc: $scope.Sc
        };
        webSvc.getShipmentTemplates(param).success(function(data){
            if (data.status.code == 0) {
                $scope.ShipmentTemplateList = data.response;
                $scope.ShipmentTemplateList.totalCount = data.totalCount;
            }
        });
    }
    $scope.Init = function () {
        $scope.PageSize = '20';
        $scope.PageIndex = 1;
        $scope.So = "asc";
        $scope.Sc = "shipmentTemplateName";
        BindShipmentList();
    }
    $scope.PageSizeChanged = function () {
        BindShipmentList();
    }
    $scope.PageChanged = function (page) {
        $scope.PageIndex = page;
        BindShipmentList();
    }
    $scope.Sorting = function (expression) {
        $scope.So = $scope.So == "asc" ? "desc" : "asc";
        $scope.Sc = expression;
        BindShipmentList();
    }

    $scope.confirm = function (shipmentTempId) {
        $scope.STemplateToDeleteShipTemp = shipmentTempId;
        $("#confirmModel").modal("show");
    }

    $scope.DeleteShipment = function () {
        $("#confirmModel").modal("hide");
        webSvc.deleteShipmentTemplate($scope.STemplateToDeleteShipTemp).success(function(data){
            if (data.status.code == 0) {
                toastr.success("Shipment template deleted successfully")
                BindShipmentList();
            }
        });
    }

});

appCtrls.controller('AddAutoTempCtrl', function ($scope, rootSvc, webSvc, localDbSvc, $state, $filter, $modal, $rootScope) {
    rootSvc.SetPageTitle('Add Shipment Template');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Shipment Templates");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.Action = "Add";
    var BindLocations = function (cb) {
        webSvc.getLocations(1000000, 1, 'locationName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.LocationList = data.response;

                $scope.FromLocationList = [];
                $scope.ToLocationList = [];

                angular.forEach($scope.LocationList, function (val, key) {
                    if (val.companyName) {
                        var dots = val.companyName.length > 20 ? '...' : '';
                        var companyName = $filter('limitTo')(val.companyName, 20) + dots;
                        $scope.LocationList[key].DisplayText = val.locationName + ' (' + companyName + ')';
                    }
                    else {
                        $scope.LocationList[key].DisplayText = val.locationName;
                    }

                    if (val.startFlag == "Y")
                        $scope.FromLocationList.push(val);
                    if (val.endFlag == "Y")
                        $scope.ToLocationList.push(val);

                })

                if (cb)
                    cb;
            }
        });
    }
    var BindAlertProfiles = function (cb) {
        webSvc.getAlertProfiles(1000000, 1, 'alertProfileName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.AlertList = data.response;
            }

            if (cb)
                cb;
        });
    }
    var BindNotificationSchedules = function (cb) {
        webSvc.getNotificationSchedules(1000000, 1, 'notificationScheduleName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.NotificationList = data.response;
            }

            if (cb)
                cb;
        });
    }
    $scope.Init = function () {
        $scope.ShipmentTemplate = {};
        $scope.ShipmentTemplate.detectLocationForShippedFrom = false;
        $scope.ShipmentTemplate.shutdownDeviceAfterMinutes = '120';
        $scope.ShipmentTemplate.alertSuppressionMinutes = 120;
        $scope.ShipmentTemplate.addDateShipped = false;
        $scope.ShipmentTemplate.excludeNotificationsIfNoAlerts = false;
        $scope.NotificationScheduleOption = {
            multiple: true
        };
        BindLocations();
        BindAlertProfiles();
        BindNotificationSchedules();
    }
    $scope.mapOptions = {
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    $scope.map = new google.maps.Map(document.getElementById('map'), $scope.mapOptions);
    $scope.map.setCenter(new google.maps.LatLng(20.632784, 78.969727));
    $scope.$watch("ShipmentTemplate.detectLocationForShippedFrom", function (nVal, oVal) {
        if (nVal) {
            $scope.ShipmentTemplate.shippedFrom = "";

            if ($scope.HomeMarker)
                $scope.HomeMarker.setMap(null);
            if ($scope.Path)
                $scope.Path.setMap(null);
        }
    })
    $scope.ChangeShipmentFrom = function () {

        if ($scope.ShipmentTemplate.shippedFrom) {
            $scope.ShipmentTemplate.detectLocationForShippedFrom = false;
        }

        if ($scope.HomeMarker)
            $scope.HomeMarker.setMap(null);

        $scope.HomeMarker = new google.maps.Marker({
            position: new google.maps.LatLng($scope.ShipmentTemplate.shippedFrom.location.lat, $scope.ShipmentTemplate.shippedFrom.location.lon),
            map: $scope.map,
            icon: '/theme/img/mapStart.png'
        });

        $scope.map.setCenter(new google.maps.LatLng($scope.ShipmentTemplate.shippedFrom.location.lat, $scope.ShipmentTemplate.shippedFrom.location.lon));

        $scope.HomeMarker.setMap($scope.map);

        if ($scope.ShipmentTemplate.shippedFrom && $scope.ShipmentTemplate.shippedTo) {
            $scope.DrawLine([$scope.ShipmentTemplate.shippedFrom.location, $scope.ShipmentTemplate.shippedTo.location])
        }
    }
    $scope.ChangeShipmentTo = function () {

        if ($scope.EndMarker)
            $scope.EndMarker.setMap(null);

        $scope.EndMarker = new google.maps.Marker({
            position: new google.maps.LatLng($scope.ShipmentTemplate.shippedTo.location.lat, $scope.ShipmentTemplate.shippedTo.location.lon),
            map: $scope.map,
            icon: '/theme/img/mapStop.png'
        });

        $scope.map.setCenter(new google.maps.LatLng($scope.ShipmentTemplate.shippedTo.location.lat, $scope.ShipmentTemplate.shippedTo.location.lon));
        $scope.EndMarker.setMap($scope.map);

        if ($scope.ShipmentTemplate.shippedFrom && $scope.ShipmentTemplate.shippedTo) {
            $scope.DrawLine([$scope.ShipmentTemplate.shippedFrom.location, $scope.ShipmentTemplate.shippedTo.location])
        }
    }
    $scope.DrawLine = function (arrayOfLatLang) {
        if ($scope.Path)
            $scope.Path.setMap(null);

        var bounds = new google.maps.LatLngBounds();
        $scope.Route = [];
        angular.forEach(arrayOfLatLang, function (val, key) {
            $scope.Route.push(new google.maps.LatLng(val.lat, val.lon))
            bounds.extend(new google.maps.LatLng(val.lat, val.lon));
        })

        $scope.Path = new google.maps.Polyline(
        {
            path: $scope.Route,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 5
        });

        $scope.Path.setMap($scope.map);
        $scope.map.fitBounds(bounds);
    }
    $scope.SaveData = function (isValid) {
        if (isValid) {
            if (!$scope.ShipmentTemplate.shutdownDeviceAfterMinutes)
                $scope.ShipmentTemplate.shutdownDeviceAfterMinutes = null;

            if (!$scope.ShipmentTemplate.arrivalNotificationWithinKm)
                $scope.ShipmentTemplate.arrivalNotificationWithinKm = null;

            $scope.ShipmentTemplate.maxTimesAlertFires = null;
            $scope.ShipmentTemplate.useCurrentTimeForDateShipped = true;

            if ($scope.ShipmentTemplate.shippedFrom)
                $scope.ShipmentTemplate.shippedFrom = $scope.ShipmentTemplate.shippedFrom.locationId;
            if ($scope.ShipmentTemplate.shippedTo)
                $scope.ShipmentTemplate.shippedTo = $scope.ShipmentTemplate.shippedTo.locationId;

            // $scope.AuthToken = localDbSvc.getToken();
            // var url = .url + 'saveShipmentTemplate/' + $scope.AuthToken
            // $.ajax({
            //     type: "POST",
            //     datatype: "json",
            //     processData: false,
            //     contentType: "text/plain",
            //     data: JSON.stringify($scope.ShipmentTemplate),
            //     url: url,
            //     success: function (data, textStatus, XmlHttpRequest) {
            //         toastr.success("Shipment template added successfully")
            //         $state.go('manage.shiptemp')
            //     },
            //     error: function (xmlHttpRequest, textStatus, errorThrown) {
            //         alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            //     }
            // });
            webSvc.saveShipmentTemplate($scope.ShipmentTemplate).success( function (data, textStatus, XmlHttpRequest) {
                toastr.success("Shipment template added successfully")
                $state.go('manage.shiptemp')
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });
        }
    }
    $scope.openAddLocation = function () {
        $rootScope.modalInstance = $modal.open({
            templateUrl: '/app/manage-location/add-edit.html',
            controller: 'AddLocCtrl',
        })

        $rootScope.modalInstance.result.then(function () {
            BindLocations(function () {
                if ($scope.ShipmentTemplate.shippedFrom) {
                    var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedFrom.locationId }, true)[0];
                    if (shippedFrom)
                        $scope.ShipmentTemplate.shippedFrom = shippedFrom;
                }
                if ($scope.ShipmentTemplate.shippedTo) {
                    var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedTo.locationId }, true)[0];
                    if (shippedFrom)
                        $scope.ShipmentTemplate.shippedTo = shippedTo;
                }
            });
        });
    };
    $scope.openEditLocation = function (locationId) {
        if (locationId) {
            $rootScope.locationIdForModalPopup = locationId;
            $rootScope.modalInstance = $modal.open({
                templateUrl: '/app/manage-location/add-edit.html',
                controller: 'EditLocCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindLocations(function () {
                    if ($scope.ShipmentTemplate.shippedFrom) {
                        var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedFrom.locationId }, true)[0];
                        if (shippedFrom)
                            $scope.ShipmentTemplate.shippedFrom = shippedFrom;
                    }
                    if ($scope.ShipmentTemplate.shippedTo) {
                        var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedTo.locationId }, true)[0];
                        if (shippedTo)
                            $scope.ShipmentTemplate.shippedTo = shippedTo;
                    }
                });
            });
        }
    };
    $scope.openAddAlert = function () {
        $rootScope.modalInstance = $modal.open({
            templateUrl: '/app/manage-alert/add-edit.html',
            controller: 'AddAlertCtrl',
        });

        $rootScope.modalInstance.result.then(function () {
            BindAlertProfiles(function () {
                if ($scope.ShipmentTemplate.alertProfileId) {
                    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId }, true)[0];
                    if (alertProfile)
                        $scope.ShipmentTemplate.alertProfileId = alertProfile;
                }
            })
        });
    };
    $scope.openEditAlert = function (alertId) {
        if (alertId) {
            $rootScope.alertIdForModalPopup = alertId;
            $rootScope.modalInstance = $modal.open({
                templateUrl: '/app/manage-alert/add-edit.html',
                controller: 'EditAlertCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindAlertProfiles(function () {
                    if ($scope.ShipmentTemplate.alertProfileId) {
                        var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId }, true)[0];
                        if (alertProfile)
                            $scope.ShipmentTemplate.alertProfileId = alertProfile;
                    }
                })
            });
        }
    };
    $scope.openAddNoti = function () {
        $rootScope.modalInstance = $modal.open({
            templateUrl: '/app/manage-notification/add-edit.html',
            controller: 'AddNotiCtrl',
        });

        $rootScope.modalInstance.result.then(function () {
            BindNotificationSchedules(function () {
                //if ($scope.ShipmentTemplate.alertProfileId) {
                //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId })[0];
                //    if (alertProfile)
                //        $scope.ShipmentTemplate.alertProfileId = alertProfile;
                //}
            })
        });
    };
    $scope.openEditNoti = function (notiId) {

        if (notiId) {
            if (notiId.length > 0) {
                notiId = notiId[0];
            }
            $rootScope.notiIdForModalPopup = notiId;
            $rootScope.modalInstance = $modal.open({
                templateUrl: '/app/manage-notification/add-edit.html',
                controller: 'EditNotiCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindNotificationSchedules(function () {
                    //if ($scope.ShipmentTemplate.alertProfileId) {
                    //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId })[0];
                    //    if (alertProfile)
                    //        $scope.ShipmentTemplate.alertProfileId = alertProfile;
                    //}
                })
            });
        }
    };

    $scope.CreateAlertRule = function () {
        if ($scope.AlertList && $scope.AlertList.length > 0) {
            var selectedAlertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId }, true);
            if (selectedAlertProfile && selectedAlertProfile.length > 0) {
                selectedAlertProfile = selectedAlertProfile[0];
                if (selectedAlertProfile.alertRuleList) {
                    angular.forEach(selectedAlertProfile.alertRuleList, function (val, key) {
                        if (key != 0)
                            $scope.alertRuleListForSelectedAlertProfile = $scope.alertRuleListForSelectedAlertProfile + ", " + val;
                        else
                            $scope.alertRuleListForSelectedAlertProfile = val;
                    })
                }
            }
        }
    }

    $scope.ChangeNotiScheduleForAlert = function () {
        console.log($scope.ShipmentTemplate.alertsNotificationSchedules);
        if ($scope.ShipmentTemplate && $scope.ShipmentTemplate.alertsNotificationSchedules) {
            $scope.AlertNotiRule = '';
            for (var i = 0; i < $scope.ShipmentTemplate.alertsNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.ShipmentTemplate.alertsNotificationSchedules[i]) }, true)
                if (shipment && shipment.length > 0) {
                    shipment = shipment[0];
                    var peopleToNotify = shipment.peopleToNotify ? shipment.peopleToNotify : "";
                    if ($scope.AlertNotiRule)
                        $scope.AlertNotiRule = $scope.AlertNotiRule + ', ' + peopleToNotify;
                    else
                        $scope.AlertNotiRule = peopleToNotify;
                }
            }
        }
    }

    $scope.ChangeNotiScheduleForArrival = function () {
        
        if ($scope.ShipmentTemplate && $scope.ShipmentTemplate.arrivalNotificationSchedules) {
            $scope.ArrivalNotiRule = '';
            for (var i = 0; i < $scope.ShipmentTemplate.arrivalNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.ShipmentTemplate.arrivalNotificationSchedules[i]) }, true)

                if (shipment) {
                    if (shipment.length > 0) {
                        shipment = shipment[0];
                        var peopleToNotify = shipment.peopleToNotify ? shipment.peopleToNotify : "";
                        if ($scope.ArrivalNotiRule)
                            $scope.ArrivalNotiRule = $scope.ArrivalNotiRule + ', ' + peopleToNotify;
                        else
                            $scope.ArrivalNotiRule = peopleToNotify;
                    }
                }
            }
        }
    }
});

appCtrls.controller('EditAutoTempCtrl', function ($scope, rootSvc, localDbSvc, $stateParams, $state, $filter, $rootScope, $modal, webSvc) {
    rootSvc.SetPageTitle('Edit Shipment Template');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Shipment Templates");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.Action = "Edit";
    var BindLocations = function (cb) {

    }
    var BindAlertProfiles = function (cb) {
        webSvc.getAlertProfiles(1000000, 1, 'alertProfileName', 'asc').success(function(data){
        // .get({ action: "getAlertProfiles", token: $scope.AuthToken, pageSize: 1000000, pageIndex: 1, so: 'alertProfileName', sc: 'asc' }, function (data) {
            if (data.status.code == 0) {
                $scope.AlertList = data.response;
                $scope.CreateAlertRule();
            }

            if (cb)
                cb;
        });
    }
    var BindNotificationSchedules = function (cb) {
        webSvc.getNotificationSchedules(1000000, 1, 'notificationScheduleName', 'asc').success(function(data){
        // .get({ action: "getNotificationSchedules", token: $scope.AuthToken, pageSize: 1000000, pageIndex: 1, so: 'notificationScheduleName', sc: 'asc' }, function (data) {
            if (data.status.code == 0) {
                $scope.NotificationList = data.response;
            }

            if (cb)
                cb;
        });
    }

    //BindLocations();
    BindAlertProfiles();
    BindNotificationSchedules();

    $scope.Init = function () {
        $scope.STId = $stateParams.stId
        $scope.ShipmentTemplate = {};
        if ($scope.STId) {
            var param = {
                shipmentTemplateId: $scope.STId
            };
            webSvc.getShipmentTemplates(param).success(function(data){
            // .get({ action: "getShipmentTemplate", token: $scope.AuthToken, shipmentTemplateId: $scope.STId }, function (data) {
                if (data.status.code == 0) {
                    $scope.ShipmentTemplate = data.response;
                    if (data.response) {

                        if ($scope.ShipmentTemplate.shutdownDeviceAfterMinutes == 0)
                            $scope.ShipmentTemplate.shutdownDeviceAfterMinutes = "0";
                        else if (data.response.shutdownDeviceAfterMinutes)
                            $scope.ShipmentTemplate.shutdownDeviceAfterMinutes = data.response.shutdownDeviceAfterMinutes.toString();
                        else
                            $scope.ShipmentTemplate.shutdownDeviceAfterMinutes = "";

                        if ($scope.ShipmentTemplate.arrivalNotificationWithinKm == 0)
                            $scope.ShipmentTemplate.arrivalNotificationWithinKm = "0";
                        else if (data.response.arrivalNotificationWithinKm)
                            $scope.ShipmentTemplate.arrivalNotificationWithinKm = data.response.arrivalNotificationWithinKm.toString();
                        else
                            $scope.ShipmentTemplate.arrivalNotificationWithinKm = "";

                        webSvc.getLocations(1000000, 1, 'locationName', 'asc').success(function(data){
                            if (data.status.code == 0) {
                                $scope.LocationList = data.response;
                                $scope.FromLocationList = [];
                                $scope.ToLocationList = [];
                                angular.forEach($scope.LocationList, function (val, key) {
                                    if (val.companyName) {
                                        var dots = val.companyName.length > 20 ? '...' : '';
                                        var companyName = $filter('limitTo')(val.companyName, 20) + dots;
                                        $scope.LocationList[key].DisplayText = val.locationName + ' (' + companyName + ')';
                                    }
                                    else {
                                        $scope.LocationList[key].DisplayText = val.locationName;
                                    }

                                    if (val.startFlag == "Y")
                                        $scope.FromLocationList.push(val);
                                    if (val.endFlag == "Y")
                                        $scope.ToLocationList.push(val);
                                })

                                var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedFrom }, true);
                                if (shippedFrom && shippedFrom.length > 0) {
                                    $scope.ShipmentTemplate.shippedFrom = shippedFrom[0];
                                }

                                var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedTo }, true);
                                if (shippedTo && shippedTo.length > 0) {
                                    $scope.ShipmentTemplate.shippedTo = shippedTo[0];
                                }

                                if ($scope.ShipmentTemplate.shippedFrom)
                                    $scope.ChangeShipmentFrom();
                                if ($scope.ShipmentTemplate.shippedTo)
                                    $scope.ChangeShipmentTo();
                            }
                        });

                        $scope.ChangeNotiScheduleForAlert();
                        $scope.ChangeNotiScheduleForArrival();
                    }
                }
            })

            $scope.mapOptions = {
                zoom: 4,
                mapTypeId: google.maps.MapTypeId.TERRAIN
            }

            $scope.map = new google.maps.Map(document.getElementById('map'), $scope.mapOptions);
            $scope.map.setCenter(new google.maps.LatLng(20.632784, 78.969727));

            $scope.NotificationScheduleOption = {
                multiple: true
            };
        }
    }

    $scope.$watch("ShipmentTemplate.detectLocationForShippedFrom", function (nVal, oVal) {
        if (nVal) {
            $scope.ShipmentTemplate.shippedFrom = "";

            if ($scope.HomeMarker)
                $scope.HomeMarker.setMap(null);
            if ($scope.Path)
                $scope.Path.setMap(null);
        }
    })

    $scope.ChangeShipmentFrom = function () {
        console.log($scope.ShipmentTemplate.shippedFrom)
        if ($scope.ShipmentTemplate.shippedFrom) {
            $scope.ShipmentTemplate.detectLocationForShippedFrom = false;
        }
        else { return; }

        if ($scope.HomeMarker)
            $scope.HomeMarker.setMap(null);

        $scope.HomeMarker = new google.maps.Marker({
            position: new google.maps.LatLng($scope.ShipmentTemplate.shippedFrom.location.lat, $scope.ShipmentTemplate.shippedFrom.location.lon),
            map: $scope.map,
            icon: '/theme/img/mapStart.png'
        });

        $scope.map.setCenter(new google.maps.LatLng($scope.ShipmentTemplate.shippedFrom.location.lat, $scope.ShipmentTemplate.shippedFrom.location.lon));

        $scope.HomeMarker.setMap($scope.map);

        if ($scope.ShipmentTemplate.shippedFrom && $scope.ShipmentTemplate.shippedTo) {
            $scope.DrawLine([$scope.ShipmentTemplate.shippedFrom.location, $scope.ShipmentTemplate.shippedTo.location])
        }
    }
    $scope.ChangeShipmentTo = function () {
        console.log($scope.ShipmentTemplate.shippedTo)
        if ($scope.EndMarker)
            $scope.EndMarker.setMap(null);

        $scope.EndMarker = new google.maps.Marker({
            position: new google.maps.LatLng($scope.ShipmentTemplate.shippedTo.location.lat, $scope.ShipmentTemplate.shippedTo.location.lon),
            map: $scope.map,
            icon: '/theme/img/mapStop.png'
        });

        $scope.map.setCenter(new google.maps.LatLng($scope.ShipmentTemplate.shippedTo.location.lat, $scope.ShipmentTemplate.shippedTo.location.lon));
        $scope.EndMarker.setMap($scope.map);

        if ($scope.ShipmentTemplate.shippedFrom && $scope.ShipmentTemplate.shippedTo) {
            $scope.DrawLine([$scope.ShipmentTemplate.shippedFrom.location, $scope.ShipmentTemplate.shippedTo.location])
        }
    }
    $scope.DrawLine = function (arrayOfLatLang) {

        if ($scope.Path)
            $scope.Path.setMap(null);


        var bounds = new google.maps.LatLngBounds();
        $scope.Route = [];
        angular.forEach(arrayOfLatLang, function (val, key) {
            $scope.Route.push(new google.maps.LatLng(val.lat, val.lon))
            bounds.extend(new google.maps.LatLng(val.lat, val.lon));
        })

        $scope.Path = new google.maps.Polyline(
        {
            path: $scope.Route,
            geodesic: true,
            strokeColor: '#F37E2E',
            strokeOpacity: 1.0,
            strokeWeight: 5
        });

        $scope.Path.setMap($scope.map);
        $scope.map.fitBounds(bounds);
    }
    $scope.SaveData = function (isValid) {
        if (isValid) {

            if (!$scope.ShipmentTemplate.shutdownDeviceAfterMinutes)
                $scope.ShipmentTemplate.shutdownDeviceAfterMinutes = null;

            if (!$scope.ShipmentTemplate.arrivalNotificationWithinKm)
                $scope.ShipmentTemplate.arrivalNotificationWithinKm = null;

            $scope.ShipmentTemplate.maxTimesAlertFires = null;
            $scope.ShipmentTemplate.useCurrentTimeForDateShipped = true;

            if ($scope.ShipmentTemplate.shippedFrom)
                $scope.ShipmentTemplate.shippedFrom = $scope.ShipmentTemplate.shippedFrom.locationId;
            if ($scope.ShipmentTemplate.shippedTo)
                $scope.ShipmentTemplate.shippedTo = $scope.ShipmentTemplate.shippedTo.locationId;

            // $scope.AuthToken = localDbSvc.getToken();
            // var url = .url + 'saveShipmentTemplate/' + $scope.AuthToken
            // $.ajax({
            //     type: "POST",
            //     datatype: "json",
            //     processData: false,
            //     contentType: "text/plain",
            //     data: JSON.stringify($scope.ShipmentTemplate),
            //     url: url,
            //     success: function (data, textStatus, XmlHttpRequest) {
            //         toastr.success("Shipment template updated successfully")
            //         $state.go('manage.shiptemp')
            //     },
            //     error: function (xmlHttpRequest, textStatus, errorThrown) {
            //         alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            //     }
            // });
            
            webSvc.saveShipmentTemplate($scope.ShipmentTemplate).success( function (data, textStatus, XmlHttpRequest) {
                toastr.success("Shipment template added successfully")
                $state.go('manage.shiptemp')
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });

        }
    }
    $scope.openAddLocation = function () {
        $rootScope.modalInstance = $modal.open({
            templateUrl: '/app/manage-location/add-edit.html',
            controller: 'AddLocCtrl',
        })

        $rootScope.modalInstance.result.then(function () {
            BindLocations(function () {
                if ($scope.ShipmentTemplate.shippedFrom) {
                    var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedFrom.locationId })[0];
                    if (shippedFrom)
                        $scope.ShipmentTemplate.shippedFrom = shippedFrom;
                }
                if ($scope.ShipmentTemplate.shippedTo) {
                    var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedTo.locationId })[0];
                    if (shippedFrom)
                        $scope.ShipmentTemplate.shippedTo = shippedTo;
                }

                $scope.ChangeShipmentFrom();
                $scope.ChangeShipmentTo();
            });
        });
    };
    $scope.openEditLocation = function (locationId) {
        if (locationId) {
            $rootScope.locationIdForModalPopup = locationId;
            $rootScope.modalInstance = $modal.open({
                templateUrl: '/app/manage-location/add-edit.html',
                controller: 'EditLocCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindLocations(function () {
                    if ($scope.ShipmentTemplate.shippedFrom) {
                        var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedFrom.locationId })[0];
                        if (shippedFrom)
                            $scope.ShipmentTemplate.shippedFrom = shippedFrom;
                    }
                    if ($scope.ShipmentTemplate.shippedTo) {
                        var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedTo.locationId })[0];
                        if (shippedTo)
                            $scope.ShipmentTemplate.shippedTo = shippedTo;
                    }

                    $scope.ChangeShipmentFrom();
                    $scope.ChangeShipmentTo();
                });
            });
        }
    };
    $scope.openAddAlert = function () {
        $rootScope.modalInstance = $modal.open({
            templateUrl: '/app/manage-alert/add-edit.html',
            controller: 'AddAlertCtrl',
        });

        $rootScope.modalInstance.result.then(function () {
            BindAlertProfiles(function () {
                if ($scope.ShipmentTemplate.alertProfileId) {
                    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId })[0];
                    if (alertProfile)
                        $scope.ShipmentTemplate.alertProfileId = alertProfile;
                }
            })
        });
    };
    $scope.openEditAlert = function (alertId) {
        if (alertId) {
            $rootScope.alertIdForModalPopup = alertId;
            $rootScope.modalInstance = $modal.open({
                templateUrl: '/app/manage-alert/add-edit.html',
                controller: 'EditAlertCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindAlertProfiles(function () {
                    if ($scope.ShipmentTemplate.alertProfileId) {
                        var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId })[0];
                        if (alertProfile)
                            $scope.ShipmentTemplate.alertProfileId = alertProfile;
                    }
                })
            });
        }
    };
    $scope.openAddNoti = function () {
        $rootScope.modalInstance = $modal.open({
            templateUrl: '/app/manage-notification/add-edit.html',
            controller: 'AddNotiCtrl',
        });

        $rootScope.modalInstance.result.then(function () {
            BindNotificationSchedules(function () {
                //if ($scope.ShipmentTemplate.alertProfileId) {
                //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId })[0];
                //    if (alertProfile)
                //        $scope.ShipmentTemplate.alertProfileId = alertProfile;
                //}
            })
        });
    };
    $scope.openEditNoti = function (notiId) {

        if (notiId) {
            if (notiId.length > 0) {
                notiId = notiId[0];
            }
            $rootScope.notiIdForModalPopup = notiId;
            $rootScope.modalInstance = $modal.open({
                templateUrl: '/app/manage-notification/add-edit.html',
                controller: 'EditNotiCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindNotificationSchedules(function () {
                    //if ($scope.ShipmentTemplate.alertProfileId) {
                    //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId })[0];
                    //    if (alertProfile)
                    //        $scope.ShipmentTemplate.alertProfileId = alertProfile;
                    //}
                })
            });
        }
    };
    $scope.CreateAlertRule = function () {
        if ($scope.AlertList && $scope.AlertList.length > 0) {
            var selectedAlertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId }, true);
            if (selectedAlertProfile) {
                if (selectedAlertProfile.length > 0) {
                    selectedAlertProfile = selectedAlertProfile[0];
                    if (selectedAlertProfile.alertRuleList) {
                        angular.forEach(selectedAlertProfile.alertRuleList, function (val, key) {
                            if (key != 0)
                                $scope.alertRuleListForSelectedAlertProfile = $scope.alertRuleListForSelectedAlertProfile + ", " + val;
                            else
                                $scope.alertRuleListForSelectedAlertProfile = val;
                        })
                    }
                }
            }
        }
    }
    $scope.ChangeNotiScheduleForAlert = function () {
        if ($scope.ShipmentTemplate && $scope.ShipmentTemplate.alertsNotificationSchedules) {
            $scope.AlertNotiRule = '';
            for (var i = 0; i < $scope.ShipmentTemplate.alertsNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.ShipmentTemplate.alertsNotificationSchedules[i]) }, true)
                if (shipment) {
                    if (shipment.length > 0) {
                        shipment = shipment[0];
                        var peopleToNotify = shipment.peopleToNotify ? shipment.peopleToNotify : "";
                        if ($scope.AlertNotiRule)
                            $scope.AlertNotiRule = $scope.AlertNotiRule + ', ' + peopleToNotify;
                        else
                            $scope.AlertNotiRule = peopleToNotify;
                    }
                }
            }
        }
    }
    $scope.ChangeNotiScheduleForArrival = function () {
        if ($scope.ShipmentTemplate && $scope.ShipmentTemplate.arrivalNotificationSchedules) {
            $scope.ArrivalNotiRule = '';
            for (var i = 0; i < $scope.ShipmentTemplate.arrivalNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.ShipmentTemplate.arrivalNotificationSchedules[i]) }, true)
                if (shipment) {
                    if (shipment.length > 0) {
                        shipment = shipment[0];
                        var peopleToNotify = shipment.peopleToNotify ? shipment.peopleToNotify : "";
                        if ($scope.ArrivalNotiRule)
                            $scope.ArrivalNotiRule = $scope.ArrivalNotiRule + ', ' + peopleToNotify;
                        else
                            $scope.ArrivalNotiRule = peopleToNotify;
                    }
                }
            }
        }
    }
});