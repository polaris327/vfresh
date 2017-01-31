appCtrls.controller('ViewShipmentCtrl', function ($scope, rootSvc, webSvc, localDbSvc, $filter, $rootScope, $window) {
    rootSvc.SetPageTitle('View Shipments');
    rootSvc.SetActiveMenu('View Shipment');
    rootSvc.SetPageHeader("View Shipments");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.specificDates = false;
    $scope.ViewShipment = {
        alertsOnly: false,
        last2Days: true,
        lastDay: false,
        lastWeek: false,
        lastMonth: false,
        deviceImei: null,
        shipmentDateFrom: null,
        shipmentDateTo: null,
        shippedFrom: [],
        shippedTo: [],
        status: null,
        shipmentDescription:null,
        pageIndex: 1,
        pageSize: "20",
        sc: 'shipmentId',
        so: 'desc'
    };
    $scope.sc = 'shipmentId1';
    var bounds = null;
    $scope.vm = this;

    $scope.SearchBasic = function () {
        $scope.ViewShipment.shipmentDescription = null;
        $scope.ViewShipment.deviceImei = null;
        $scope.ViewShipment.shippedFrom = [];
        $scope.ViewShipment.shippedTo = [];
        $scope.ViewShipment.status = null;
        $scope.BindCards();
    }

    $scope.SearchAdvance = function () {
        if($scope.ViewShipment.status == "")
            $scope.ViewShipment.status = null;
        $scope.BindCards();
    }

    $scope.Print = function(){
        $window.print();
    }

    $scope.AdvanceSearch = false;
    $scope.LocationOptions = { multiple: true };

    
    var BindShipmentList = function () {
        $scope.loading = true;
        //if ($scope.ViewShipment.shipmentDateFrom) {
        //    var shippedDateFrom = new Date($scope.ViewShipment.shipmentDateFrom).toDateString();
        //    $scope.ViewShipment.shipmentDateFrom = shippedDateFrom;
        //}

        //if ($scope.ViewShipment.shipmentDateTo) {
        //    var shippedDateFrom = new Date($scope.ViewShipment.shipmentDateTo).toDateString();
        //    $scope.ViewShipment.shipmentDateTo = shippedDateFrom;
        //}
        console.log("VIEW-SHIPMENT");
        console.log("    pageIndex", $scope.ViewShipment.pageIndex);
        console.log("    pageSize", $scope.ViewShipment.pageSize);
        console.log("    SC", $scope.ViewShipment.sc);
        console.log("    SO", $scope.ViewShipment.so);
        console.log("---------------");
        webSvc.getShipments($scope.ViewShipment).success( function (data, textStatus, XmlHttpRequest) {
            
            if (data.status.code == 0) {
                $scope.ShipmentList = data.response;
                $scope.ShipmentList.totalCount = data.totalCount;
            } else if(data.status.code == 1){
                $rootScope.redirectUrl = "/view-shipment";
                $rootScope.go("login");
            };
            
            $scope.loading = false;
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }).error( function (xmlHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            $scope.loading = false;
        });
    }

    $scope.ResetSearchCriteria = function () {
        $scope.ViewShipment = {
            alertsOnly: false,
            last2Days: true,
            lastDay: false,
            lastWeek: false,
            lastMonth: false,
            deviceImei: null,
            shipmentDateFrom: null,
            shipmentDateTo: null,
            shippedFrom: [],
            shippedTo: [],
            status: null,
            pageIndex: 1,
            PageSize: "20",
            so: 'desc',
            sc: 'shipmentDate'
        };
        $scope.sc = "shipmentDate1";

        BindShipmentList();
    }

    $scope.BindCards = function () {
        BindShipmentList();
    }

    BindShipmentList();

    $scope.$on('mapInitialized', function(event, m) {
        $scope.vm.map = m;
        if(bounds != null){
            $scope.vm.map.fitBounds(bounds); 
        }
    });

    webSvc.getLocations(1000000, 1, 'locationName', 'asc').success( function (data) {
        // console.log("Location", data);
        bounds = new google.maps.LatLngBounds;
        
        if (data.status.code == 0) {
            for(i = 0 ; i < data.response.length; i ++){
                bounds.extend(new google.maps.LatLng(data.response[i].location.lat, data.response[i].location.lon));
            }
            if($scope.vm.map != undefined){
                $scope.vm.map.fitBounds(bounds);
            }
            $scope.LocationList = data.response;
            angular.forEach($scope.LocationList, function (val, key) {
                if (val.companyName) {
                    var dots = val.companyName.length > 20 ? '...' : '';
                    var companyName = $filter('limitTo')(val.companyName, 20) + dots;
                    $scope.LocationList[key].DisplayText = val.locationName + ' (' + companyName + ')';
                }
                else {
                    $scope.LocationList[key].DisplayText = val.locationName;
                }
            })
        }
    });
    webSvc.getDevices(1000000, 1, 'locationName', 'asc').success( function (data) {
        // console.log("Devi", data);
        if (data.status.code == 0) {
            $scope.TrackerList = data.response;
            // console.log(data.response);
        }
    });
    $scope.SortOptionChanged = function(){
        var order = $scope.sc.substr(-1);
        if(order == '1'){
            $scope.ViewShipment.sc = $scope.sc.substr(0, $scope.sc.length - 1);
            $scope.ViewShipment.so = "desc";
        } else{
            $scope.ViewShipment.sc = $scope.sc;
            $scope.ViewShipment.so = "asc";
        }
        BindShipmentList();
    }
    $scope.PageSizeChanged = function () {
        BindShipmentList();
    }
    $scope.PageChanged = function (page) {
        $scope.ViewShipment.pageIndex = page;
        console.log("PAGE", page);
        BindShipmentList();
    }

    $scope.$watch('ViewShipment.lastDay', function (nVal, oVal) {
        if ($scope.ViewShipment && nVal) {
            $scope.ViewShipment.lastDay = nVal;
            $scope.ViewShipment.last2Days = !nVal;
            $scope.ViewShipment.lastWeek = !nVal;
            $scope.ViewShipment.lastMonth = !nVal;
        }
    })
    $scope.$watch('ViewShipment.last2Days', function (nVal, oVal) {
        if ($scope.ViewShipment && nVal) {
            $scope.ViewShipment.lastDay = !nVal;
            $scope.ViewShipment.last2Days = nVal;
            $scope.ViewShipment.lastWeek = !nVal;
            $scope.ViewShipment.lastMonth = !nVal;
        }
    })
    $scope.$watch('ViewShipment.lastWeek', function (nVal, oVal) {
        if ($scope.ViewShipment && nVal) {
            $scope.ViewShipment.lastDay = !nVal;
            $scope.ViewShipment.last2Days = !nVal;
            $scope.ViewShipment.lastWeek = nVal;
            $scope.ViewShipment.lastMonth = !nVal;
        }
    })
    $scope.$watch('ViewShipment.lastMonth', function (nVal, oVal) {
        if ($scope.ViewShipment && nVal) {
            $scope.ViewShipment.lastDay = !nVal;
            $scope.ViewShipment.last2Days = !nVal;
            $scope.ViewShipment.lastWeek = !nVal;
            $scope.ViewShipment.lastMonth = nVal;
        }
    })
});