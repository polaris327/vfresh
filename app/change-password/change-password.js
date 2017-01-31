appCtrls.controller('ChangePWCtrl', function ($scope, rootSvc, localDbSvc, $stateParams, webSvc, $state, $location) {
	$scope.usermail = $location.search().email;
	$scope.password;
	$scope.token = $location.search().token;
	
	
	$scope.changePassword = function(){
		if(isValidPassword($scope.password)){
			webSvc.resetPassword($scope.token, $scope.usermail, $scope.password).success(function(data){
			
			    if (data.status.code == 0) {
			        toastr.success(data.status.message);
			    } else {
			    	// alert("Username or password is not correct.");
			    	toastr.warning(data.status.message);
			    }
			    $state.go("login");
			});
		} else {
			toastr.warning("Password length should be at least 8 and should included at least 1 number.", "Invalid password format!");
		}
	}

	isValidPassword = function(password){
		if(password.length < 8 || !/[0-9]/.test(password)){
			return false;
		}
		return true;
	}

	// $scope.back = function(){
	// 	$state.go("login");
	// }
});