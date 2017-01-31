appCtrls.controller('UserUpdateCtrl', function ($cookies, $scope, rootSvc, webSvc, localDbSvc, $stateParams, $state, $rootScope, $location) {

	$scope.AuthToken = localDbSvc.getToken();
	$scope.User = $rootScope.User;

    if($scope.User == undefined){
        webSvc.getUser().success( function (data) {
            $rootScope.User = data.response;
            $scope.User = data.response;
        });
    }

    isValidPassword = function(password){
		if(password.length < 8 || !/[0-9]/.test(password)){
			return false;
		}
		return true;
	}

    $scope.SavePassword = function(){

    	if($scope.password1 != $scope.password2){
    		toastr.warning("Password do not match!");
    	} else if(!isValidPassword($scope.password1)){
			toastr.warning("Password length should be at least 8 and should included at least 1 number.", "Invalid password format!");
		} else {
    		var userData = {};
	    	userData.user = $scope.User.id;
	    	userData.password = $scope.password1;
	     	webSvc.updateUserDetails(userData).success( function (data, textStatus, XmlHttpRequest) {
                if(data.status.code == 0)
                    toastr.success("Successfully updated the password");
                else
                    toastr.warning(data.status.message);
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                toastr.warning("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });
    	}
    	
    }
    
});