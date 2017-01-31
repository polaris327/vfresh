appCtrls.controller('ListTrackerCtrl', function ($scope, rootSvc, localDbSvc, webSvc) {
    rootSvc.SetPageTitle('List Trackers');
    rootSvc.SetActiveMenu('Tracker');
    rootSvc.SetPageHeader("Trackers");

    $scope.AuthToken = localDbSvc.getToken();

    var BindTrackerList = function () {
        webSvc.getDevices($scope.PageSize, $scope.PageIndex, $scope.Sc, $scope.So).success(function(data){
            console.log("TRACKER", data);
            if (data.status.code == 0) {
                $scope.TrackerList = data.response;
                $scope.TrackerList.totalCount = data.totalCount;
                console.log(data);
            }
        });
    }

    $scope.Init = function () {
        $scope.PageSize = '20';
        $scope.PageIndex = 1;
        $scope.So = "asc";
        $scope.Sc = "name";
        BindTrackerList();
    }

    $scope.PageSizeChanged = function () {
        BindTrackerList();
    }

    $scope.PageChanged = function (page) {
        $scope.PageIndex = page;
        BindTrackerList();
    }

    $scope.Sorting = function (expression) {
        $scope.So = $scope.So == "asc" ? "desc" : "asc";
        $scope.Sc = expression;
        console.log($scope.So);
        console.log($scope.Sc);
        BindTrackerList();
    }
});
