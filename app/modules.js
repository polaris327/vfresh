var appCtrls = angular.module('appCtrls', []);
var appDirs = angular.module('appDirs', []);
var appSvcs = angular.module('appSvcs', []);
var appProviders = angular.module('appProviders', []);
var appValues = angular.module('appValues', []);
var appConstants = angular.module('appConstants', []);
var appFilters = angular.module('appFilters', []);
var app = angular.module("app", ['highcharts-ng', 'ngMap', 'ui.select2', 'ngSanitize', 'ui.bootstrap', 'ui.bootstrap.tpls', 'ui.router', 'ngResource', 'ngCookies', 'appCtrls', 'appDirs', 'appSvcs', 'appProviders', 'appValues', 'appConstants', 'appFilters', 'ngSanitize', 'ngAnimate'], function ($rootScopeProvider) {
    ////this method skip error of $digest and $watch Error: $digest reaches maximum iteration
    $rootScopeProvider.digestTtl(25);
});

toastr.options = {
    "closeButton": true,
    "debug": false,
    "positionClass": "toast-bottom-right",
    "onclick": null,
    "showDuration": "1000",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "3000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

