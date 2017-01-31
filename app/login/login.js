appCtrls.controller('LoginCtrl', function ($scope, rootSvc, webSvc, localDbSvc, $stateParams, $state, $rootScope, $location, $templateCache, $timeout) {

	// $templateCache.remove('/login');
	// console.log("cleared cache");

	$rootScope.showHeader = true;
	$scope.toggle = false;
	$scope.username = localDbSvc.getUsername();
	$scope.password = localDbSvc.getPassword();
	localDbSvc.setToken("_");
	$scope.AuthToken = "_";
	var loginTimer;
	
	function loginTimeOut(){
		toastr.error("Login timeout! Please try again");
	}

	$scope.login = function(){

		if($scope.toggle){
			localDbSvc.setUsername($scope.username);
			localDbSvc.setPassword($scope.password);
		}
        // console.log("Updating tracker data...");
        loginTimer = $timeout(loginTimeOut, 5000);
		webSvc.login($scope.username, $scope.password).success(function(data){
			$timeout.cancel(loginTimer);
		    if (data.status.code == 0) {
		    	localDbSvc.setToken(data.response.token, data.response.expired);
		    	console.log(data.response);
				console.log(localDbSvc.getToken());
		        $scope.AuthToken = data.response.token;
		        $rootScope.AuthToken = data.response.token;
		        if($rootScope.redirectUrl == "" || $rootScope.redirectUrl == undefined){
		        	$rootScope.redirectUrl = "/view-shipment";
		        }
		        $rootScope.showHeader = false;
		        $location.path($rootScope.redirectUrl);
		        $rootScope.redirectUrl = "";
		        toastr.success("Successfully logged in.");
		        webSvc.getUser().success(function (data) {
		        	$rootScope.User = data.response;
		        });
		    } else {
		    	toastr.warning("User e-mail address or password is incorrect.");
		    }
		});
	}

});