


app.factory('allDevices', function($resource, CONFIG) {

  return  $resource('http://'+CONFIG.homey_ip + '/api/manager/devices/?zone=:zoneId', {zoneId:'@id'}, {
    'get': {
    	action: 'GET',
    	isArray: false,
      headers:{"Authorization": "Bearer " + CONFIG.homey_api, "Content-Type": "application/json"}
    }
  });

});

app.factory('allZones', function($resource, CONFIG) {

  return  $resource('http://'+CONFIG.homey_ip + '/api/manager/zones/', null, {
    'query': {
    	action: 'GET',
    	isArray: false,
      headers:{"Authorization": "Bearer " + CONFIG.homey_api, "Content-Type": "application/json"}
    }
  });

});
app.factory('deviceState', function($resource, CONFIG) {

  return  $resource('http://'+CONFIG.homey_ip + '/api/device/:deviceId', {zoneId:'@id'}, {
    'get': {
    	action: 'GET',
    	isArray: false,
      headers:{"Authorization": "Bearer " + CONFIG.homey_api, "Content-Type": "application/json"}
    }
  });

});

app.controller('appController', function ($scope, $uibModal, $localStorage, $timeout, CONFIG, allDevices, deviceState, allZones) {
  //For testing purpose! Remove localstorage
  //$localStorage.$reset();
  $scope.defaultZone = {};
  $scope.$storage = $localStorage;


  //When Open() is called this opens the dialog for settings (Still need to change the name)
  $scope.open = function (size) {

    var modalInstance = $uibModal.open({
      templateUrl: 'settings_modal.html',
      controller: 'SettingsCtrl',
      size: size
    });
    modalInstance.result.then(function (saveId) {
      $scope.$storage.defaultZone = saveId;
      console.log('New default zone saved!');
    });
  };

    //Check if we have a defaultZone already, if not open the settings dialog.
    if(!$scope.$storage.defaultZone){
         console.log('No default zone found, showing dialog');
         $scope.open();
       }
       else{
         console.log('Default zone found, showing devices in that zone! ' + $scope.$storage.defaultZone);
       }


       //Get zones and push to fronted.
       allZones.query(function(res) {
           $scope.zones = res.result;
       });

       //Get alldevices within the default zone and push to frontend.
       allDevices.get({zoneId:$scope.$storage.defaultZone}, function(res) {
         var itemsProcessed = 0;
           angular.forEach(res.result, function(value, key, array) {
             deviceState.get({deviceId:value.id}, function(state) {
               itemsProcessed++;
               res.result[key].state = state.result;
               if(itemsProcessed === array.length) {
                 $scope.devicelist = res.result;
               }
             });
         });
       });

    // Set interval
    $scope.intervalFunction = function(){
      timer = $timeout(function() {

        allDevices.get({zoneId:$scope.$storage.defaultZone}, function(res) {
          var itemsProcessed = 0;
            angular.forEach(res.result, function(value, key, array) {
              deviceState.get({deviceId:value.id}, function(state) {
                itemsProcessed++;
                res.result[key].state = state.result;
                if(itemsProcessed === array.length) {
                  $scope.devicelist = res.result;
                }
              });
          });
        });
        $scope.intervalFunction();
      }, 1000)
    };

    // Kick off the interval
    $scope.intervalFunction();


});

//Controller for the settingsmodal
app.controller('SettingsCtrl', function ($scope, $uibModalInstance, allZones) {
  //Get zones and push to fronted.
  allZones.query(function(res) {
      $scope.zones = res.result;
  });
  $scope.saveSettings = function(saveId){
    $uibModalInstance.close(saveId);
  };

});



//Bootstrap angular to load config file
angular.element(document).ready(
    function() {
        var initInjector = angular.injector(['ng']);
        var $http = initInjector.get('$http');
        $http.get('config.json').then(
            function (response) {
               var config = response.data;
               // Add additional services/constants/variables to your app,
               // and then finally bootstrap it:
               app.constant('CONFIG', response.data);
               angular.bootstrap(document, ['homeydash']);
            }
        );
    }
);
