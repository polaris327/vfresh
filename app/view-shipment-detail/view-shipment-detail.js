appCtrls.controller('ViewShipmentDetailCtrl', function ($scope, rootSvc, webSvc, $stateParams, $filter, NgMap, $sce, $rootScope, $templateCache, $timeout, $window) {

    // $templateCache.remove('/view-shipment-detail');
    // console.log("cleared view-shipment-detail cache");

    rootSvc.SetPageTitle('View Shipment Detail');
    rootSvc.SetActiveMenu('View Shipment');
    rootSvc.SetPageHeader("View Shipment Detail");

    $scope.ShipmentId = $stateParams.vsId; 
    var plotLines = new Array();
    $scope.vm = this;
    $scope.specialMarkers = new Array();
    $scope.normalMarkers = new Array();
    $scope.previousActiveMarker = -1;
    //includes all tracker info here
    $scope.trackers = new Array();
    var trackerRoute = null;
    //------MAIN TRACKER INDEX ------
    $scope.MI = 0;
    $scope.mapInfo = {};
    var bounds= null;

    //------CHART SERIES DATA  ------
    var chartSeries = new Array();
    var subSeries = new Array();
    var alertData = new Array();

    //google map first point
    $scope.firstPoint = {};
    $scope.currentPoint = {};
    $scope.trackerPath = [];
    $scope.trackerColor = rootSvc.getTrackerColor(0);
    $scope.trackerMsg = new Array();

    //------Reload data every 10 min BEGIN-------
    var refreshTimer;
    function refreshData(){
        loadTrackerData();
        // console.log("Updating tracker data...");
        refreshTimer = $timeout(refreshData, 300000);
    }

    refreshTimer = $timeout(refreshData, 300000);
    $scope.$on("$destroy", function(event){
        $timeout.cancel(refreshTimer);
    });
    //------Reload data every 10 min END-------

    $scope.$on('mapInitialized', function(event, m) {
        $scope.vm.map = m;
        if(bounds != null){
            $scope.vm.map.fitBounds(bounds); 
        }
        if(trackerRoute != null){
            trackerRoute.setMap($scope.vm.map);
        }
    });

    $scope.Print = function(){
        $window.print();
    }

    function updateMapData(index){
        var locations = $scope.trackers[index].locations;
        
        while($scope.trackerPath.length > 0){
            $scope.trackerPath.pop();
        }
        while($scope.specialMarkers.length > 0){
            $scope.specialMarkers.pop();
        }
        while($scope.normalMarkers.length > 0){
            $scope.normalMarkers.pop();
        }

        // console.log($scope.vm.map);
        bounds = new google.maps.LatLngBounds;

        for(i = 0 ; i < locations.length; i ++){

            bounds.extend(new google.maps.LatLng(locations[i].lat, locations[i].long));

            $scope.trackerPath.push({
                lat: locations[i].lat, 
                lng: locations[i].long});
            //markers
            if(locations[i].alerts.length > 0){
                if(locations[i].alerts[0].type == 'LastReading'){
                    $scope.specialMarkers.push({index: $scope.specialMarkers.length, len: 16, oi: i, data: locations[i], iconUrl: "theme/img/Tracker" + (index + 1) + ".png", tinyIconUrl: "theme/img/tinyTracker" + (index + 1) + ".png"});    
                } else {
                    $scope.specialMarkers.push({index: $scope.specialMarkers.length, len: 24, oi: i, data: locations[i], iconUrl: "theme/img/alert" + locations[i].alerts[0].type + ".png", tinyIconUrl: "theme/img/tinyAlert" + locations[i].alerts[0].type + ".png"});    
                }
            }
            // $scope.normalMarkers.push({index: $scope.normalMarkers.length, oi: i, data: locations[i], iconUrl: "theme/img/edot.png", len: 12, normal: true});
        }
        //map bound part
        // console.log($scope.mapInfo);
        if($scope.mapInfo.endLocationForMap != null)
            bounds.extend(new google.maps.LatLng($scope.mapInfo.endLocationForMap.latitude, $scope.mapInfo.endLocationForMap.longitude));
        if($scope.mapInfo.startLocationForMap != null)
        bounds.extend(new google.maps.LatLng($scope.mapInfo.startLocationForMap.latitude, $scope.mapInfo.startLocationForMap.longitude));
        
        if(trackerRoute != null){
            trackerRoute.setMap(null);
        }
        trackerRoute = new google.maps.Polyline({
            path: $scope.trackerPath,
            strokeColor: $scope.trackers[index].siblingColor,
            strokeOpacity: 0.5,
            strokeWeight: 5
        });
        // console.log($scope.vm.map, bounds);
        // console.log($scope.vm.map);
        if($scope.vm.map != undefined){
            $scope.vm.map.fitBounds(bounds); 
            trackerRoute.setMap($scope.vm.map);
            //Apply Shape route first
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }
    }

    $scope.switchTracker = function(index){
        $scope.chartConfig.redraw= true;
        updateMapData(index);
        $scope.changeActiveTracker(index);
    }

    $scope.changeActiveTracker = function(index){

        $scope.MI = index;

        if($scope.trackers[index].locations.length == 0){
            toastr.warning("No data recorded yet!", "Empty Track");
            return;
        }

        $scope.trackerInfo = $scope.trackers[index];
        prepareMainHighchartSeries();
        prepareTrackerMessage();
        prepareAlertHighchartSeries();
        refreshHighchartSeries();
        updatePlotLines();
        //-------PREPARE HIGHCHART DATA-------
        // prepareHighchartSeries();
    }

    function updatePlotLines(){
        while(plotLines.length > 0){
            plotLines.pop();
        }

        var ti = $scope.trackers[$scope.MI].locations;
        var lastPoint = ti.length - 1;
        var mainTrackerPeriod = parseDate(ti[lastPoint].timeISO) - parseDate(ti[0].timeISO);
        mainTrackerPeriod /= 25;
        var color = "#000";
        var width = 2;
        // <b class="bold-font">' + $scope.mapInfo.startLocation + '</b>
        plotLines.push({
            color: color, // Color value
            dashStyle: 'solid', // Style of the plot line. Default to solid
            value: parseDate($scope.mapInfo.startTimeISO), // Value of where the line will appear
            width: width, // Width of the line    
            label: {
                text: '<table><tr><td style="vertical-align:top;"><img src="theme/img/locationStart.png"></td>' + 
                        '<td><br/>' + 
                        '</td></tr></table>',
                rotation: 0,
                useHTML: true,
                align: 'left',
                y: -20,
                x: -10
            }
        });

        
        var dottext = "";
        if($scope.trackers[$scope.MI].status.toLowerCase() == "arrived"){
            time = parseDate($scope.trackerInfo.arrivalTimeISO);
        } else {
            var time = new Date();
        }

        if(time > parseDate(ti[lastPoint].timeISO) + mainTrackerPeriod ||
            $scope.trackers[$scope.MI].status.toLowerCase() != "arrived"){
            color = "#ccc";
            width = 1;
            time = parseDate(ti[lastPoint].timeISO) + mainTrackerPeriod + 1;
            dottext = '<sup><b class="dottext">...</b></sup>';
        }
        plotLines.push({
            color: color, // Color value
            dashStyle: 'solid', // Style of the plot line. Default to solid
            value: time,//mainData[lastPoint][0], // Value of where the line will appear
            width: width, // Width of the line    
            label: {
                text:   '<img src="theme/img/locationStop.png" style="float:right; vertical-align:bottom;">' + 
                        '<span style="text-align:right;float:right">' + 
                            '<b class="bold-font">' + $scope.mapInfo.endLocation + '</b><br/>' + 
                            dottext + 
                        '</span>',
                rotation: 0,
                useHTML: true,
                align: 'right',
                y: -20,
                x: -15
            }
        });
    }

    function prepareTrackerMessage(){

        var info = $scope.trackers[$scope.MI];
        while($scope.trackerMsg.length > 0){
            $scope.trackerMsg.pop();
        }

        for(i = 0; i < info.locations.length; i++){
                    //prepare tracker message data
            var obj = {};
            obj.title = "Tracker " + info.deviceSN + "(" + info.tripCount + ")";
            obj.lines = ['<div><span class="tt_temperature">' + info.locations[i].temperature.toFixed(1) + '<sup>o</sup>C</span><span>' + formatDate(parseDate(info.locations[i].timeISO)) + '</span></div>'];
            $scope.trackerMsg.push([obj]);
        }
        // console.log($scope.trackerMsg.length);
    }

    function updateMapMarker(){
    }
    
    $scope.showPathInfo = function(){
        // console.log(this);
    }
    $scope.showAlertsUI = function(){
        // console.log("UI");
        $scope.markerData = this.data;
        $scope.ttShow = true;
        $scope.msgForMap = [];
        for(var i = 0; i < $scope.trackerMsg[this.data.oi].length; i++){
            var tmp = {};
            tmp.mkttl = $sce.trustAsHtml($scope.trackerMsg[this.data.oi][i].title);    
            tmp.mapMarkerMessage = $scope.trackerMsg[this.data.oi][i].lines;
            $scope.msgForMap.push(tmp);
        }
        
        $scope.diagColor = $scope.trackerColor;
        
        if(!$scope.$$phase) {
            $scope.$apply();
        }
        // if($scope.markerData.data.alerts[0].type == "LastReading"){
            // $scope.diagColor = $scope.trackerColor;
        // }
        // updateMapMarker();
    }
    $scope.hideAlertsUI = function(){
        $scope.ttShow = false;
    }
    $scope.showAlerts = function(index){
        //mouse out
        if(index == -1){
            $scope.currentPoint.iconUrl = "theme/img/edot.png";
            $scope.currentPoint.len = 12;
        } else {
            //For alerts, only black circle without point in it.
            $scope.currentPoint.iconUrl = "theme/img/dot.png";

            for(i = 0; i < $scope.specialMarkers.length; i++){
                if($scope.specialMarkers[i].oi == index){
                    $scope.currentPoint.iconUrl = "theme/img/outdot.png";
                    break;
                }
            }
            $scope.currentPoint.loc = $scope.trackers[$scope.MI].locations[index];
            $scope.currentPoint.len = 35;
        }
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    }

    loadTrackerData();    

    function loadTrackerData(){

        webSvc.getSingleShipment($scope.ShipmentId).success( function (graphData) {
            // console.log("Success", graphData);
            if(graphData.status.code !=0){
                toastr.error(graphData.status.message, "Error");
                return;
            }

            var info = graphData.response;
            // console.log(info);

            //Map start and end location info
            $scope.mapInfo.startLocationForMap = info.startLocationForMap;
            $scope.mapInfo.startTimeISO = info.startTimeISO;
            $scope.mapInfo.startLocation = info.startLocation;
            $scope.mapInfo.endLocationForMap = info.endLocationForMap;
            $scope.mapInfo.endLocation = info.endLocation;
            $scope.mapInfo.etaISO = info.etaISO;
            $scope.mapInfo.arrivalTimeISO = info.arrivalTimeISO;
            $scope.mapInfo.lastReadingTimeISO = info.lastReadingTimeISO;

            // console.log("******", info.locations.length);

            //------------PREPARE TRACKERS INFO  BEGIN-------------
            var tempObj = {};
            for(var k in info){
                if(info.hasOwnProperty(k)){
                    tempObj[k] = info[k];
                }
            }
            if(tempObj.alertYetToFire != null)
                tempObj.alertYetToFire = tempObj.alertYetToFire.split(",");
            tempObj.loaded = true;
            tempObj.loadedForIcon = true;
            console.log("MainTracker", tempObj.locations.length);
            //$scope.trackers[0] is the main tracker here.
            //at the first time, it addes new tracker info to the $scope.trackers
            //next time, it only updates the main tracker info, not insert it to $scope.trackers
            if($scope.trackers.length == 0){
                $scope.trackers.push(tempObj);
                for(i = 0; i < info.siblings.length; i++){
                    $scope.trackers.push(info.siblings[i]);
                    $scope.trackers[i + 1].loaded = false;
                }
            }
            else
                $scope.trackers[0] = tempObj;

            //Load Sibling Shipment details
            
            //refresh siblings
            
            //reload sibling info
            for(i = 0; i < info.siblings.length; i++){
                $scope.trackers[i + 1].loadedForIcon = false;


                webSvc.getSingleShipment(info.siblings[i].shipmentId).success( function (graphData) {
                    if(graphData.status.code != 0) return;
                    dt = graphData.response;
                    // console.log(dt.shipmentId);
                    // debugger;
                    for(j = 1; j < $scope.trackers.length; j++){
                        if($scope.trackers[j].shipmentId == dt.shipmentId){
                            for(var k in dt){
                                if(dt.hasOwnProperty(k)){
                                    $scope.trackers[j][k] = dt[k];
                                }
                            }
                            if($scope.trackers[j].alertYetToFire != null)
                                $scope.trackers[j].alertYetToFire = $scope.trackers[j].alertYetToFire.split(",");
                            $scope.trackers[j].loaded = true;
                            $scope.trackers[j].loadedForIcon = true;
                            prepareMainHighchartSeries();
                            refreshHighchartSeries();
                            break;
                        }
                    }
                });
            }
            for(i = 0; i < $scope.trackers.length; i++){
                $scope.trackers[i].siblingColor = rootSvc.getTrackerColor(i);
                $scope.trackers[i].index = i;
            }
            //------------PREPARE TRACKERS INFO    END-------------

            //set tracker information
            angular.forEach(tempObj.alertsNotificationSchedules, function(child, index){
                child.index = index;
            });

            //start and end location info

            var locations = info.locations;
            //google map data
            $scope.firstPoint = locations[0];
            $scope.currentPoint.loc = locations[0];
            $scope.currentPoint.iconUrl = "theme/img/edot.png";
            
            updateMapData($scope.MI);

            // console.log($scope.trackerPath);
            
            $scope.changeActiveTracker($scope.MI);
            
            $scope.chartConfig = {
                redraw: false,
                options:{
                    plotOptions: {
                        series: {
                            point: {
                                events: {
                                    mouseOver: function () {
                                        var idx;
                                        for(index = 0; index < $scope.trackers[$scope.MI].locations.length; index ++){
                                            if(parseDate($scope.trackers[$scope.MI].locations[index].timeISO) == this.x){
                                                idx = index;
                                                break;
                                            }
                                        }
                                        // $scope.firstPoint = $scope.trackers[$scope.MI].locations[idx];
                                        // console.log(idx);
                                        $scope.showAlerts(idx);
                                    },
                                    mouseOut: function () {
                                        $scope.showAlerts(-1);
                                    }
                                }
                            }
                        }
                    },
                    scrollbar : {
                        enabled : false,
                    },
                    credits: {
                        enabled: false
                    },
                    rangeSelector: {
                        selected: 2,
                        enabled: true,
                        inputEnabled: false,
                        buttonTheme: {
                            visibility: 'hidden'
                        },
                        labelStyle: {
                            visibility: 'hidden'
                        }
                    },
                    navigator: {
                        enabled: true
                    },
                    // yAxis: {
                    //  title: {
                    //      align: 'left',
                    //      text: "Temperature <sup>o</sup>C"
                    //  }
                    // },
                    tooltip: {
                        style: {
                            padding: '0px',
                        },
                        shadow: false,
                        backgroundColor: 'rgba(249, 249, 249, 0)',
                        borderWidth: 0,
                        useHTML: true,
                        hideDelay: 500,
                        formatter: function () {
                            
                            var index;
                            for(index = 0; index < $scope.trackers[$scope.MI].locations.length; index ++){
                                if(parseDate($scope.trackers[$scope.MI].locations[index].timeISO) == this.x) break;
                            }
                            var color = this.points[0].series.color;
                            msg = $scope.trackerMsg[index];
                            var message = "";
                            
                            for(var j = 0; j < msg.length; j ++){
                                //if this message is for alert show title
                                if(msg[j].title.indexOf(".png") != -1){
                                    message += "<div class='tt_title' style='background-color:" + color + "'>" 
                                        + msg[j].title + "<div style='clear:both;'></div></div>";
                                }
                                message += "<div class='tt_body'>";    
                                for(var k = 0; k < msg[j].lines.length; k ++){
                                    message += "<div>" + msg[j].lines[k] + "</div>";
                                }
                                message += "</div>";
                            }
                            
                            var cont = "";
                            cont += "<div class='ttbox' style='z-index: 100; border-color:" + color + "'>";
                            cont += message;
                            cont += "</div>";
                            return cont;
                        }
                    },
                    yAxis:{
                        labelAlign: 'left',
                        opposite: false,
                        gridLineColor: '#CCC',
                        lineColor:"#000",
                        tickColor:"#000",
                        lineWidth:1,
                        tickWidth: 1,
                        title: {
                            align: 'middle',
                            offset: 40,
                            text: 'Temperature °C',
                            y: -10
                        },
                        labels:{
                            align:'right',
                            x:-10
                        },
                        tickInterval: 5,
                        plotBands: [{
                            from: 0,
                            to: 5,
                            color: 'rgba(0, 255, 0, 0.2)',
                        }, {
                            from: -25,
                            to: -18,
                            color: 'rgba(0, 0, 255, 0.2)',
                        }]
                    },
                    xAxis:{
                        type: 'datetime',
                        labels: {
                            formatter: function() {
                                // return this.value + "Date";
                                return formatDateAxis(this.value);
                            },
                        },
                        lineWidth:1,
                        ordinal: false,
                        lineColor:"#000",
                        tickColor:"#000",
                        gridLineDashStyle: "Solid",
                        gridLineWidth: 1,
                        plotLines: plotLines
                    },
                    navigation: {
                        buttonOptions: {
                            enabled: false
                        }
                    }
                },
                series: chartSeries,
                useHighStocks: true
            }
            
        });
    }   

    function refreshHighchartSeries(){

        // console.log($scope.MI);
        while(chartSeries.length > 0){
            chartSeries.pop();
        }

        chartSeries.push({
            name: "Tracker " + $scope.trackers[$scope.MI].deviceSN + "(" + $scope.trackers[$scope.MI].tripCount + ")",
            marker: {
                symbol: 'url(theme/img/dot.png)'
            },
            color: $scope.trackers[$scope.MI].siblingColor,
            lineWidth: 3,
            data: subSeries[$scope.MI]
        }); 

        //Add gap to the start and end
        var ti = $scope.trackers[$scope.MI].locations;
        var lastPoint = ti.length - 1;
        var mainTrackerPeriod = parseDate(ti[lastPoint].timeISO) - parseDate(ti[0].timeISO);
        mainTrackerPeriod /= 25;
        // console.log("MAIN", mainTrackerPeriod);
        var color = Highcharts.getOptions().colors[0];
        var gapColor = new Highcharts.Color(color).setOpacity(0).get();
        var gap = new Array(); 
        gap.push([parseDate(ti[0].timeISO) - mainTrackerPeriod, ti[0].temperature]);
        gap.push([parseDate(ti[lastPoint].timeISO) + mainTrackerPeriod, ti[lastPoint].temperature]);

        for (i = 0; i < subSeries.length; i ++) {
            if(i == $scope.MI || !$scope.trackers[i].loaded) continue;
            chartSeries.push({
                name: "Tracker " + $scope.trackers[i].deviceSN + "(" + $scope.trackers[i].tripCount + ")",
                color: $scope.trackers[i].siblingColor,
                lineWidth: 1,
                data: subSeries[i],
                enableMouseTracking: false
            });   
        }

        // console.log(chartSeries);
        chartSeries.push({
            data: gap,
            enableMouseTracking: false,
            color: gapColor
        });

        for(i = 0; i < alertData.length; i++){
            chartSeries.push({
                name: "Alerts",
                color: "#b3bcbf",
                lineWidth: 3,
                enableMouseTracking: false,
                data: alertData[i]
            });
        }
    }

    function prepareAlertHighchartSeries(){
        while(alertData.length > 0){
            alertData.pop();
        }
        // console.log($scope.MI);
        // debugger;
        for(i = 0 ; i < $scope.trackers[$scope.MI].locations.length; i ++){
            var alertinfo = $scope.trackers[$scope.MI].locations[i].alerts;
            if(alertinfo.length == 1){
                var str = alertinfo[0].type;
                var alert = "";
                if(str == "LastReading") str = "Tracker" + ($scope.MI + 1);
                else alert = "Alert";
                obj = {};
                obj.x = parseDate($scope.trackers[$scope.MI].locations[i].timeISO);
                obj.y = $scope.trackers[$scope.MI].locations[i].temperature;
                obj.marker = {
                    enabled: true,
                    symbol: 'url(theme/img/' + alert.toLowerCase() + str + '.png)'
                };
                var tmpArray = new Array();
                tmpArray.push(obj);
                alertData.unshift(tmpArray);
                //update msg
                var msg = {};

                msg.title = "<img src='theme/img/tiny" + alert + str + ".png'/><span>" + alertinfo[0].title + "</span>";
                msg.lines = [alertinfo[0].Line1];   
                if(alertinfo[0].Line2 != undefined){
                    msg.lines.push(alertinfo[0].Line2);
                }
                $scope.trackerMsg[i] = [msg];
            } else if(alertinfo.length > 1){
                obj = {};
                obj.x = parseDate($scope.trackers[$scope.MI].locations[i].timeISO);
                obj.y = $scope.trackers[$scope.MI].locations[i].temperature;
                obj.marker = {
                    enabled: true,
                    symbol: 'url(theme/img/alerts.png)'
                };
                var tmpArray = new Array();
                tmpArray.push(obj);
                alertData.unshift(tmpArray);
                //update msg
                var alertmsg = [];
                for(var k = 0; k < alertinfo.length; k++){
                    var str = alertinfo[k].type;
                    var alert = "";
                    if(str == "LastReading") str = "Tracker" + ($scope.MI + 1);
                    else alert = "Alert";
                    var msg = {};
                    msg.title = "<img src='theme/img/tiny" + alert + str + ".png'/><span>" + alertinfo[k].title + "</span>";
                    msg.lines = [alertinfo[k].Line1];   
                    if(alertinfo[k].Line2 != undefined){
                        msg.lines.push(alertinfo[k].Line2);
                    }
                    alertmsg.push(msg);
                }
                
                $scope.trackerMsg[i] = alertmsg;
            }
        }
        
        lastPoint = subSeries[$scope.MI].length - 1;
        //Destination
        obj = {};
        // console.log(subSeries, $scope.MI, lastPoint);
        obj.x = subSeries[$scope.MI][lastPoint][0];
        obj.y = subSeries[$scope.MI][lastPoint][1];
        obj.z = 30;
        obj.marker = {
            enabled: true,
            symbol: 'url(theme/img/tracker' + ($scope.MI + 1) + '.png)'
        };

        trackerDest.pop();
        trackerDest.push(obj);
    }

    $scope.generatePDF = function(){

        console.log("clicked pdf button");
        var printContents ='<html><head><link rel="stylesheet" href="./css/app.css"/></head><body id="pdf">'+document.getElementById("print-content").innerHTML+'</body></html>';
        alert("OK");
        alert(document.getElementById("print-content").innerHTML);
        var popupWin = window.open('', 'app', '');
        popupWin.document.open();
        popupWin.document.write(printContents);
        try{
            //var pdf = new jsPDF('p','pt','a4');
            var pdf = new jsPDF('landscape');
            pdf.addHTML(popupWin.document.body,function() {
                var string = pdf.output('datauristring');
                $('.preview-pane').attr('src', string);
            });
        }
        catch(e) {
            console.error(e.message,e.stack,e);
        }

        var file ='Demo';

        if (typeof doc !== 'undefined') {
            doc.save(file + '.pdf');
        } else if (typeof pdf !== 'undefined') {
            setTimeout(function() {
                pdf.save(file + '.pdf');
            }, 2000);
        } else {
            alert('Error 0xE001BADF');
        }
    }

    function prepareMainHighchartSeries(){
        
        while(subSeries.length > 0){
            subSeries.pop();
        }

        //calculate chart arrange and cut down the others
        var startTime = parseDate($scope.trackers[$scope.MI].locations[0].timeISO);
        var endTime = parseDate($scope.trackers[$scope.MI].locations[$scope.trackers[$scope.MI].locations.length - 1].timeISO);
        
        var gap = (endTime - startTime) / 25;

        startTime -= gap;
        endTime += gap;

        //Add siblings tracker data to the subSeries
        for(i = 0; i < $scope.trackers.length; i++){
            if(!$scope.trackers[i].loaded) {
                subSeries.push(new Array());
                continue;
            }
            var locations = $scope.trackers[i].locations;
            var skipCnt = locations.length / 300;
            var tmpCnt = 0;
            var series = new Array();
            for(j = 0; j < locations.length; j++){
                if(j != 0){
                    if(++tmpCnt <= skipCnt) {
                        if(locations[j].alerts.length == 0) continue;
                    } else {
                        tmpCnt = 0;
                    }
                }
                temp = new Array();
                temp.push(parseDate(locations[j].timeISO));
                temp.push(locations[j].temperature);
                if(startTime <= temp[0] && temp[0] <= endTime){
                    series.push(temp);
                }

            }
            // console.log("--------",series.length);
            subSeries.push(series);
        }
    }

    function parseDate(date){
        var newDate = date.replace('-', '/').replace('-', '/') + ":00";
        return Date.parse(newDate);
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
        return curr_hour + ":" + curr_min + ampm + " " + curr_date + " " + m_names[curr_month] + " " + curr_year;
    }

    function formatDateAxis(date){
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

        return curr_hour + ":" + curr_min + ampm + "<br/>" + curr_date + "." + m_names[curr_month] + "." + curr_year;
    }

    
});