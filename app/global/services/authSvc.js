appSvcs.factory("AuthInterceptor", ["$rootScope", "$location", function ($rootScope, $location) {
    
    return {
        response: function(response){
            
            if(response.data.status != undefined && response.data.status.code != undefined &&response.data.status.code == 1){
                // console.log($location.path());
                // console.log($location.path());
                // console.log("FAIL", response);
            	if($location.path() != "/login" && $location.path() != "/change-password"){
            		$rootScope.redirectUrl = $location.path();
                    $rootScope.go("login");
            	}
            }
            return response;
        }
    }
}]);