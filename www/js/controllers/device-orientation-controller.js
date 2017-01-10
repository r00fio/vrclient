/**
 * Created by r00fi0 on 12/30/16.
 */
/**
 * Created by r00fi0 on 12/22/16.
 */
var application = angular.module('app');

application.controller('DeviceOrientationCtrl', ['$scope', '$state', '$rootScope', '$timeout','$interval',
    function ($scope, $state, $rootScope, $timeout,$interval) {

        if (window.screen.lockOrientation) {
            window.screen.lockOrientation('portrait');
        }
        var host = 'http://192.168.1.43:3000/';
        $scope.rotation = {};
        $scope.old = {};
        $scope.skipSendData = false;

        $timeout(function () {
            var watchID = cordova.plugins.magnetometer.watchReadings(onSuccess,onError)
        },5000)

        $scope.rotation = {};
        function onSuccess(result) {
            $scope.rotation.x = Math.round(result.x * 100);
            $scope.rotation.y = Math.round(result.y * 100);
            $scope.rotation.z = Math.round(result.z * 100);
            $rootScope.$applyAsync();
            sendData();
            // console.log('success')
            
        };
        

        function onError(fusionError) {
            alert('Fusion error: ' + fusionError.code);
        };


        function sendData(url, leg) {
            if (!url) {
                url = host + 'orientation'
            }
            var data = {
                x: $scope.rotation.x,
                y: $scope.rotation.y,
                z: $scope.rotation.z,
                DZ: $scope.directionZ,
                DX: $scope.directionX,
                T: $scope.rotation.timestamp,
                leg: leg
            }

            $.ajax({
                type: 'POST',
                url: url,
                data: data,
                success: function (data) {
                },
                dataType: 'json',
                async: false
            });

        }

    }]);
