appSvcs.service("localDbSvc", ["$cookies", function ($cookies) {

    //set localstorage item
    this.set = function (key, value) {
        localStorage.setItem(key, value);
    }
    //remove local storage item
    this.remove = function (key) {
        localStorage.removeItem(key);
    }
    //get local storage item
    this.get = function(key){
        return localStorage.getItem(key);
    };
    //set token to the cookie
    this.setToken = function(token, expireDate){
        $cookies.put('Token', token);
    }
    //get token from the cookie
    this.getToken = function(){
        if($cookies.get('Token') == undefined)
            return "_";
        return $cookies.get('Token');
    }
    //set username
    this.setUsername = function(username){
        $cookies.put("login_username", username);
    }
    //get username
    this.getUsername = function(){
        return $cookies.get("login_username");
    }
    //set password
    this.setPassword = function(password){
        $cookies.put("login_password", password);
    }
    //get password
    this.getPassword = function(){
        return $cookies.get("login_password");
    }

}]);