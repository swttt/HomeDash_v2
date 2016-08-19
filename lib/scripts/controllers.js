
// A factory to get all devices and the current state to every device.

app.factory('allDevices', function($http, CONFIG, $localStorage, $q) {
  var obj = {};
      obj = function(zoneId){
        promises = [];
        return $http.get('http://'+CONFIG.homey_ip + '/api/manager/devices/?zone='+zoneId, CONFIG.httpconfig)
                .then(function (response) {
                    var devices = response.data.result;
                    return $q.all(devices.map(function (device) {
                        return $http.get('http://'+CONFIG.homey_ip + '/api/device/'+device.id, CONFIG.httpconfig)
                                .then(function (response) {
                                    device.state = response.data.result;
                                    promises.push(device);
                                });
                    })).then(function () {
                        return promises;
                    });
                });
              }
      return obj;
});

app.factory('setDevice', function($http, CONFIG) {
  var obj = {};
      obj = function(currentId, cmd){
          return $http.put('http://'+CONFIG.homey_ip+'/api/device/'+currentId, {'onoff':cmd}, CONFIG.httpconfig);
      }
   return obj;
});

// A factory to get all the zones known in Homey.
app.factory('allZones', function($http, CONFIG) {
  var obj = {};
      obj = function(){
          return $http.get('http://'+CONFIG.homey_ip + '/api/manager/zones/', CONFIG.httpconfig);
      }
   return obj;
});



// This controller controls everything in the "main view".

app.controller('appController', function ($scope, $uibModal, $localStorage, $timeout, CONFIG, allDevices, allZones, setDevice, hmTouchEvents) {
  //For testing purpose! Remove localstorage
  //$localStorage.$reset();
  $scope.defaultZone = {};
  $scope.$storage = $localStorage;


  //When Open() is called this opens the dialog for settings, notice that this dialog gets his own Controller!
  //Note to myself: Change the name
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
       allZones().success(function(response){
           $scope.zones = response.result;
       });

       //Get alldevices within the default zone and push to frontend.
       allDevices($scope.$storage.defaultZone).then(function(response){
           $scope.devicelist = response;
       });

    // Set interval
    $scope.intervalFunction = function(){
      timer = $timeout(function() {

        //Get alldevices within the default zone and push to frontend.
        allDevices($scope.$storage.defaultZone).then(function(response){
            $scope.devicelist = response;
            console.log(response);
        });
        $scope.intervalFunction();
      }, 1000)
    };

    // Kick off the interval
    $scope.intervalFunction();


    // Control devices
    // Single tap icon event
    $scope.tap = function(currentId, cmd){
      setDevice(currentId, cmd);
    }

});

//Controller for the settingsmodal
app.controller('SettingsCtrl', function ($scope, $uibModalInstance, allZones) {
  //Get zones and push to fronted.
  //Get zones and push to fronted.
  allZones().success(function(response){
      $scope.zones = response.result;
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
               config.httpconfig = {headers: {"Authorization": "Bearer "+response.data.homey_api, "Content-Type": "application/json"}};
               app.constant('CONFIG', config);
               console.log(config);
               angular.bootstrap(document, ['homeydash']);
            }
        );
    }
);
