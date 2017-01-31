appCtrls.controller('reloadCtrl', function ($scope, $state, $rootScope, $location, localDbSvc, webSvc, $timeout, $document, $templateCache) {
	
    $rootScope.readNotification = [];
    $rootScope.unreadNotification = [];
    $rootScope.closedNotification = [];
    $rootScope.closeText = "";
    $rootScope.loading = false;
    $scope.showRead = false;
    // $rootScope.showRead= false;
    webSvc.getUser().success(function (data) {
        if(data.status.code == 0){
            $rootScope.User = data.response;    
            loadNotifications();
        }
    });

    $scope.clearCache = function() { 
        $templateCache.removeAll();
        toastr.info("Cleared cache");
    }

    // $scope.clearCache();

    $rootScope.height = $document.height();

    $rootScope.test = function(){
        if($scope.showRead == true){
            $rootScope.closeText = "------------------  Closed  ------------------";
            $rootScope.closedNotification = $rootScope.readNotification;
        } else {
            $rootScope.closeText = "";
            $rootScope.closedNotification = [];
        }
    }

    markAsRead = function(data){
        webSvc.markNotificationsAsRead(data).success(function(data){
            if(data.status.code != 0){
                toastr.warning(data.status.message);
            }
        });
    }

    $rootScope.closeAll = function(){
        var data = [];
        var cnt = $rootScope.unreadNotification.length;
        for(i = 0; i < cnt; i++){
            data.push($rootScope.unreadNotification[0].notificationId);
            $rootScope.readNotification.push($rootScope.unreadNotification[0]);
            $rootScope.unreadNotification.splice(0, 1);
        }
        if($scope.showRead)
            $rootScope.closedNotification = $rootScope.readNotification;
        markAsRead(data);
    }

    $rootScope.readNotify = function(id){
        
        var data = [id];
        
        markAsRead(data);

        for(i = 0; i < $rootScope.unreadNotification.length; i++){
            if($rootScope.unreadNotification[i].notificationId == id){
                $rootScope.unreadNotification[i].closed = true;
                $rootScope.readNotification.push($rootScope.unreadNotification[i]);
                $rootScope.unreadNotification.splice(i, 1);
                break;
            }
        }
    }

    loadNotifications = function(){
        webSvc.getNotifications(true).success(function (data) {  
            if(data.status.code == 0){
                
                while($rootScope.readNotification.length > 0){
                    $rootScope.readNotification.pop();
                }
                while($rootScope.unreadNotification.length > 0){
                    $rootScope.unreadNotification.pop();
                }

                for(i = 0; i < data.response.length; i++){
                    var lnk = data.response[i].link;
                    lnk = lnk.substr("http://stf.smarttrace.com.au".length);
                    lnk = lnk.substr(0, lnk.length - "{shipmentId}".length);
                    lnk = lnk + data.response[i].shipmentId;
                    data.response[i].link = lnk;
                    
                    if(data.response[i].Line3 != undefined)
                        data.response[i].Line3 = data.response[i].Line3.replace("Description", "Desc");

                    var diff = hourdiff(data.response[i].date);
                    if(parseInt(diff/24) == 0) data.response[i].date = (diff % 24)  + " hrs ago";
                    else if(parseInt(diff/24) == 1) data.response[i].date = "Yesterday";
                    else data.response[i].date = diff + " days ago";

                    if(data.response[i].closed){
                        $rootScope.readNotification.push(data.response[i]);
                    } else {
                        $rootScope.unreadNotification.push(data.response[i]);
                    }
                }
            }
        });
    }


    $rootScope.updateUserTime = function() {
        webSvc.getUserTime().success( function (timeData) {
            if (timeData.status.code == 0) {
                $scope.tickInterval = 1000 //ms
                $rootScope.RunningTime = new Date(timeData.response.dateTimeIso);
                
                $rootScope.timeDiff = $rootScope.RunningTime - new Date();
                $rootScope.timeDiff -= $rootScope.timeDiff % 100000;
                
                $rootScope.RunningTimeZoneId = timeData.response.timeZoneId // get the current timezone
                
                var tick = function () {
                    $rootScope.RunningTime = formatDate(Date.parse(new Date()) + $rootScope.timeDiff);
                    $timeout(tick, $scope.tickInterval); // reset the timer
                }
                // Start the timer
                $timeout(tick, $scope.tickInterval);
            }
        });
    }

    function formatDate(date){
        var m_names = new Array("Jan", "Feb", "Mar", 
            "Apr", "May", "Jun", "Jul", "Aug", "Sep", 
            "Oct", "Nov", "Dec");
        var d = new Date(date);

        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        var curr_year = d.getFullYear();

        var curr_hour = d.getHours();
        var curr_min = d.getMinutes();
        var ampm = curr_hour >= 12 ? 'PM' : 'AM';
        curr_hour %= 12;
        curr_hour = curr_hour ? curr_hour : 12;
        curr_hour = ("00" + curr_hour).slice(-2);
        curr_min = ("00" + curr_min).slice(-2);
        return curr_date + "-" + m_names[curr_month] + "-" + curr_year + " " + curr_hour + ":" + curr_min + ampm;;
    }
	
    $rootScope.updateUserTime();

    function hourdiff(alertDate) {
        var first = new Date(alertDate);
        var second = new Date();
        return Math.round((second-first)/(1000*60*60));
    }

    //Get Notifications
    //

	$(".menu-li a").on("click", function () {
        if ($state.current.name == $rootScope.previousState.name) {
            $state.go($state.current, {}, { reload: true }); 
        }
    })

    $('.dropdown-notification > ul').click(function(e) {
        e.stopPropagation();
    });
});
