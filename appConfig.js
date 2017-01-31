app.constant("Api", { url: "https://smarttrace.com.au/web/vf/rest/" });

// executes only once for an app, calls evertime when page refreshed by user
app.run(function ($state, $rootScope, $resource, localDbSvc, $timeout, $templateCache) {
  
    $rootScope.go = function(url){
        $state.go(url);
    }

    $rootScope.$on('$routeChangeStart', function (event, next, current) { 
        $rootScope.$storage = $localStorage; 
        console.log("Before clear");
        if (typeof (current) !== 'undefined') { 
            $templateCache.remove(current.templateUrl); 
            console.log("Cleared");
        } 
    }); 
    
    // $templateCache.removeAll();
    

    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {

            if (toState) {
                $rootScope.previousState = toState
            }
            else {
                $rootScope.previousState = fromState
            };

            if ($rootScope.modalInstance)
                $rootScope.modalInstance.close('cancel');

        });
});

app.config(['$locationProvider', '$stateProvider', '$controllerProvider', '$provide', '$httpProvider', '$compileProvider', '$filterProvider', '$injector', function ($locationProvider, $stateProvider, $controllerProvider, $provide, $httpProvider, $compileProvider, $filterProvider, $injector) {
    ////register controller,service,factory,value,constant etc....
    appCtrls.controller = $controllerProvider.register;
    appDirs.directive = $compileProvider.directive;;
    appFilters.filter = $filterProvider.register;
    appSvcs.factory = $provide.factory;
    appSvcs.service = $provide.service;
    appValues.value = $provide.value;
    appConstants.constant = $provide.constant;
   
    //#endregion Register Controllers,Services,Factorys,Values,Constants,Directives & Filters
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['Access-Control-Allow-Methods'];
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    
    $httpProvider.interceptors.push([
        '$injector',
        function ($injector){
            return $injector.get('AuthInterceptor');
        }
    ]);
}]);
