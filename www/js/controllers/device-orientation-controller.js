/**
 * Created by r00fi0 on 12/30/16.
 */
/**
 * Created by r00fi0 on 12/22/16.
 */
var application = angular.module('app');

application.controller('DeviceOrientationCtrl', ['$scope', '$state', '$rootScope', '$timeout', '$interval',
    function ($scope, $state, $rootScope, $timeout, $interval) {

        if (window.screen.lockOrientation) {
            window.screen.lockOrientation('portrait');
        }

        $scope.rotation = {};
        $scope.old = {};
        $scope.skipSendData = false;
        $scope.url = localStorage.getItem('host');

        $timeout(function () {
            var watchID = cordova.plugins.magnetometer.watchReadings(onSuccess, onError)
            // var options = {frequency: 7};  // Update every 3 seconds
            navigator.accelerometer.watchAcceleration(success, onError, options);
        }, 3000);
        
        function success(result) {
            result.ax = result.x;
            result.ay = result.y;
            result.az = result.z;
            onSuccess(result);
        }
        
        function onSuccess(result) {
            $scope.rotation.ax = Math.round(result.ax * 100);
            $scope.rotation.ay = Math.round(result.ay * 100);
            $scope.rotation.az = Math.round(result.az * 100);
            
            $scope.rotation.mx = Math.round(result.mx * 100);
            $scope.rotation.my = Math.round(result.my * 100);
            $scope.rotation.mz = Math.round(result.mz * 100);
            
            $scope.rotation.gx = Math.round(result.gx * 100);
            $scope.rotation.gy = Math.round(result.gy * 100);
            $scope.rotation.gz = Math.round(result.gz * 100);
            $scope.rotation.timestamp = result.timestamp;
            //
            // $scope.rotation.x = result.quaternion.x * 100;
            // $scope.rotation.y = result.quaternion.y * 100;
            // $scope.rotation.z = result.quaternion.z * 100;
            // $scope.rotation.mx = result.mx * 100;
            // $scope.rotation.my = result.my * 100;
            // $scope.rotation.mz = result.mz * 100;
            // $scope.rotation.w = result.w * 100;
            
            // $scope.rotation.pitch = result.eulerAngles.pitch;
            // $scope.rotation.roll = result.eulerAngles.roll;
            // $scope.rotation.yaw = result.eulerAngles.yaw;
            
            $rootScope.$applyAsync();
            sendData();
            // console.log('success')

        };


        function onError(fusionError) {
            $scope.magnetometerError = 'error';
        };


        function sendData() {

            var data = {
                w: $scope.rotation.w,
                ax: $scope.rotation.ax,
                ay: $scope.rotation.ay,
                az: $scope.rotation.az,
                yaw:$scope.rotation.yaw,
                pitch:$scope.rotation.pitch,
                roll:$scope.rotation.roll,
                mx: $scope.rotation.mx,
                my: $scope.rotation.my,
                mz: $scope.rotation.mz,
                gx: $scope.rotation.gx,
                gy: $scope.rotation.gy,
                gz: $scope.rotation.gz,
                
                T: $scope.rotation.timestamp
            }

            $.ajax({
                type: 'POST',
                url: $scope.url + '/orientation',
                data: data,
                success: function (data) {
                },
                dataType: 'json',
                async: false
            });
        }

    }]);
