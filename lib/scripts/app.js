var app = angular.module('homeydash', ['ui.bootstrap', "ngStorage", "ngRoute", "hmTouchEvents", "angular.filter" ]);

// allow DI for use in controllers, unit tests
  app.constant('_', window._)
  // use in views, ng-repeat="x in _.range(3)"
  app.run(function ($rootScope, CONFIG) {
     $rootScope._ = window._;
     $rootScope.config = CONFIG;
  });

  app.config(function($routeProvider) {
         $routeProvider

             // route for the lights
             .when('/', {
                 templateUrl : 'pages/lights.html',
                 controller  : 'lightsController'
             })

             // route for the sensors
             .when('/sensors', {
                 templateUrl : 'pages/sensors.html',
                 controller  : 'sensorsController'
             })



     });
