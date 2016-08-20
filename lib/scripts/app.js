var app = angular.module('homeydash', ['ui.bootstrap', "ngStorage", "ngRoute", "hmTouchEvents" ]);

// allow DI for use in controllers, unit tests
  app.constant('_', window._)
  // use in views, ng-repeat="x in _.range(3)"
  app.run(function ($rootScope, CONFIG) {
     $rootScope._ = window._;
     $rootScope.config = CONFIG;
  });
