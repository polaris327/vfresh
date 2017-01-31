appSvcs.factory("rootSvc", ["$rootScope", function ($rootScope) {
    var trackerColor = ['#0b9c0b', '#2744ff', '#b7176d', '#252149', '#a16be2', 
                        '#20cbff', '#8d4a2c', '#fe3a3a', '#ff6417', '#ddc861'];
    return {
        //set page title
        SetPageTitle: function (pageTitle) {
            $rootScope.PageTitle = pageTitle;
        },
        SetActiveMenu: function (menuName) {
            $rootScope.ActiveMenu = menuName;
        },
        SetPageHeader: function (headerName) {
            $rootScope.PageHeader = headerName;
        },
        getTrackerColor: function(index){
            return trackerColor[index];
        }
    }
}]);