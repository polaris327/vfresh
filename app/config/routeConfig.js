var tick = (new Date()).getTime();
console.log(tick);
appConstants.constant('routes', [
      {
          name: 'login',
          config: {
              url: "/login"
              , views: {
                  "content": {
                      templateUrl: "app/login/login.html"
                       , controller: 'LoginCtrl'
                  }
              }
          },
          dependencies: [
              'app/login/login.js?v=' + tick,
          ]
      },
      {
          name: 'preference',
          config: {
              url: "/preference"
              , views: {
                  "content": {
                      templateUrl: "app/preference/preference.html"
                       , controller: 'PreferenceCtrl'
                  }
              }
          },
          dependencies: [
              'app/preference/preference.js?v=' + tick,
          ]
      },
      {
          name: 'user-update',
          config: {
              url: "/user-update"
              , views: {
                  "content": {
                      templateUrl: "app/user-update/user-update.html"
                       , controller: 'UserUpdateCtrl'
                  }
              }
          },
          dependencies: [
              'app/user-update/user-update.js?v=' + tick,
          ]
      },
      {
          name: 'forgetpassword',
          config: {
              url: "/forget-password"
              , views: {
                  "content": {
                      templateUrl: "app/forget-password/forget-password.html"
                       , controller: 'ForgetCtrl'
                  }
              }
          },
          dependencies: [
              'app/forget-password/forget-password.js?v=' + tick,
          ]
      },
      {
          name: 'changepassword',
          config: {
              url: "/change-password"
              , views: {
                  "content": {
                      templateUrl: "app/change-password/change-password.html"
                       , controller: 'ChangePWCtrl'
                  }
              }
          },
          dependencies: [
              'app/change-password/change-password.js?v=' + tick,
          ]
      },
      {
          name: 'newshipment',
          config: {
              url: "/new-shipment"
              , views: {
                  "content": {
                      templateUrl: "app/new-shipment/new-shipment.html"
                       , controller: 'NewShipmentCtrl'
                  }
              }
          },
          dependencies: [
              'app/new-shipment/new-shipment.js?v=' + tick
          ]
      },
      {
          name: 'viewshipment',
          config: {
              url: "/view-shipment"
              , views: {
                  "content": {
                      templateUrl: "app/view-shipment/view-shipment.html"
                       , controller: 'ViewShipmentCtrl'
                  }
              }
          },
          dependencies: [
              'app/view-shipment/view-shipment.js?v=' + tick,
          ]
      },
      {
          name: 'viewshipmentdetail',
          config: {
              url: "/view-shipment-detail/:vsId"
              , views: {
                  "content": {
                      templateUrl: "app/view-shipment-detail/view-shipment-detail.html"
                       , controller: 'ViewShipmentDetailCtrl as vm'
                  }
              }
          },
          dependencies: [
              'app/view-shipment-detail/view-shipment-detail.js?v=' + tick,
          ]
      },
      {
          name: 'tracker',
          config: {
              url: "/tracker"
              , views: {
                  "content": {
                      templateUrl: "app/manage-tracker/list.html"
                       , controller: 'ListTrackerCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-tracker/manage-tracker.js?v=' + tick,
          ]
      },
      {
          name: 'manage',
          config: {
              url: "/manage",
              abstract:true
              , views: {
                  "content": {
                      templateUrl: "app/global/layout/manage.html"
                  }
              }
          }
      },
      {
          name: 'manage.alert',
          config: {
              url: "/alert"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-alert/list.html"
                       , controller: 'ListAlertCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-alert/manage-alert.js?v=' + tick,
          ]
      },
      {
          name: 'manage.addalert',
          config: {
              url: "/add-alert"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-alert/add-edit.html"
                       , controller: 'AddAlertCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-alert/manage-alert.js?v=' + tick,
          ]
      },
      {
          name: 'manage.editalert',
          config: {
              url: "/edit-alert/:aId"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-alert/add-edit.html"
                       , controller: 'EditAlertCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-alert/manage-alert.js?v=' + tick,
          ]
      },
      {
          name: 'manage.noti',
          config: {
              url: "/notification"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-notification/list.html"
                       , controller: 'ListNotiCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-notification/manage-notification.js?v=' + tick,
          ]
      },
      {
          name: 'manage.addnoti',
          config: {
              url: "/add-notification"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-notification/add-edit.html"
                       , controller: 'AddNotiCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-notification/manage-notification.js?v=' + tick,
              'app/global/directives/weekdays.js?v=' + tick
          ]
      },
      {
          name: 'manage.editnoti',
          config: {
              url: "/edit-notification/:nId"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-notification/add-edit.html"
                       , controller: 'EditNotiCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-notification/manage-notification.js?v=' + tick,
              'app/global/directives/weekdays.js?v=' + tick
          ]
      },
      {
          name: 'manage.loc',
          config: {
              url: "/location"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-location/list.html"
                       , controller: 'ListLocCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-location/manage-location.js?v=' + tick,
          ]
      },
      {
          name: 'manage.addloc',
          config: {
              url: "/add-location"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-location/add-edit.html"
                       , controller: 'AddLocCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-location/manage-location.js?v=' + tick,
          ]
      },
      {
          name: 'manage.editloc',
          config: {
              url: "/edit-location/:lId"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-location/add-edit.html"
                       , controller: 'EditLocCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-location/manage-location.js?v=' + tick,
          ]
      },
      {
          name: 'manage.shiptemp',
          config: {
              url: "/shipment-template"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-shipment-template/list.html"
                       , controller: 'ListShipTempCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-shipment-template/manage-shipment-template.js?v=' + tick,
          ]
      },
      {
          name: 'manage.addshiptemp',
          config: {
              url: "/add-shipment-template"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-shipment-template/add-edit.html"
                       , controller: 'AddShipTempCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-shipment-template/manage-shipment-template.js?v=' + tick
          ]
      },
      {
          name: 'manage.editshiptemp',
          config: {
              url: "/edit-shipment-template/:stId"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-shipment-template/add-edit.html"
                       , controller: 'EditShipTempCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-shipment-template/manage-shipment-template.js?v=' + tick,
          ]
      },
      {
          name: 'manage.user',
          config: {
              url: "/user"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-user/list.html"
                       , controller: 'ListUserCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-user/manage-user.js',
          ]
      },
      {
          name: 'manage.adduser',
          config: {
              url: "/add-user"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-user/add-edit.html"
                       , controller: 'AddUserCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-user/manage-user.js?v=' + tick,
          ]
      },
      {
          name: 'manage.edituser',
          config: {
              url: "/edit-user/:uId"
              , views: {
                  "sub-content": {
                      templateUrl: "app/manage-user/add-edit.html"
                       , controller: 'EditUserCtrl'
                  }
              }
          },
          dependencies: [
              'app/manage-user/manage-user.js?v=' + tick,
          ]
      },
      {
          name: 'manage.autotemp',
          config: {
              url: "/autostart-template"
              , views: {
                  "sub-content": {
                      templateUrl: "app/autostart-template/list.html"
                       , controller: 'ListAutoTempCtrl'
                  }
              }
          },
          dependencies: [
              'app/autostart-template/autostart-template.js?v=' + tick,
          ]
      },
      {
          name: 'manage.addautotemp',
          config: {
              url: "/add-autostart-template"
              , views: {
                  "sub-content": {
                      templateUrl: "app/autostart-template/add-edit.html"
                       , controller: 'AddAutoTempCtrl'
                  }
              }
          },
          dependencies: [
              'app/autostart-template/autostart-template.js?v=' + tick
          ]
      },
      {
          name: 'manage.editautotemp',
          config: {
              url: "/edit-autostart-template/:stId"
              , views: {
                  "sub-content": {
                      templateUrl: "app/autostart-template/add-edit.html"
                       , controller: 'EditAutoTempCtrl'
                  }
              }
          },
          dependencies: [
              'app/autostart-template/autostart-template.js?v=' + tick,
          ]
      }
]);

//#endregion Register Routes Here

app.config(['$stateProvider', '$urlRouterProvider', 'routes',
    function ($stateProvider, $urlRouterProvider, routes) {
        ////following code is for add route with its dependancies for lazyloading
        angular.forEach(routes, function (route) {
            if (route.dependencies) {
                route.config.resolve = {
                    deps: function ($q, $rootScope) {
                        var deferred = $q.defer();
                        require(route.dependencies, function () {
                            $rootScope.$apply(function () {
                                deferred.resolve();
                            });
                        });
                        return deferred.promise;
                    }
                };
            }
            $stateProvider.state(route.name, route.config);
        });

        $urlRouterProvider.otherwise('/new-shipment');

    }]);