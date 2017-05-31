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

        $scope.calibrateSensors = function () {
            $timeout(function () {
                $scope.stop.tmpCounter.x = 0;
                $scope.stop.x = $scope.rotation.accelerometer.x;
                
                $scope.stop.tmpCounter.z = 0;
                $scope.stop.z = $scope.rotation.accelerometer.z;
                
                $rootScope.$applyAsync();
                
                var audio = new Audio('sounds/calibration_complete.mp3')
                audio.volume = 1;
                audio.play();
            }, 2000)
        };

        $scope.offset = 4000;
        $scope.url = localStorage.getItem('host');
        $scope.rotation = {accelerometer: {}};
        $scope.stop = {
            x: 3970,
            y: 3970,
            z: 3970,
            tmpCounter: {
                x: 0,
                z: 0
            },
            countLimit: {
                x: 100,
                z: 100
            }
        };
        $scope.direction = {
            x: 'stop',
            z: 'stop',
            old: {
                x: 'stop',
                z: 'stop'
            }
        };
        $scope.sensivity = {stop: {x: 100, z: 200}};

        $timeout(function () {
            // var watchID = cordova.plugins.magnetometer.watchReadings(onSuccess, onError);
            var options = {frequency: 30};  // Update every 3 seconds
            navigator.accelerometer.watchAcceleration(success, onError, options);
        }, 3000);

        function success(result) {
            result.ax = result.x;
            result.ay = result.y;
            result.az = result.z;
            onSuccess(result);
        }

        function onSuccess(result) {
            $scope.rotation.accelerometer.x = Math.round(result.ax * 100) + $scope.offset;
            $scope.rotation.accelerometer.y = Math.round(result.ay * 100) + $scope.offset;
            $scope.rotation.accelerometer.z = Math.round(result.az * 100) + $scope.offset;

            $rootScope.$applyAsync();

            if ($scope.rotation.accelerometer.z > $scope.stop.z + $scope.sensivity.stop.z) {
                $scope.direction.z = 'right'
            } else if ($scope.rotation.accelerometer.z < $scope.stop.z - $scope.sensivity.stop.z) {
                $scope.direction.z = 'left'
            } else {
                $scope.direction.z = 'stop';
            }

            if ($scope.rotation.accelerometer.x > $scope.stop.x + $scope.sensivity.stop.x) {
                $scope.direction.x = 'up'
            } else if ($scope.rotation.accelerometer.x < $scope.stop.x - $scope.sensivity.stop.x) {
                $scope.direction.x = 'down'
            } else {
                $scope.direction.x = 'stop';
            }

            if ($scope.direction.x != $scope.direction.old.x ||
                $scope.direction.z != $scope.direction.old.z) {
                $scope.direction.old.z = $scope.direction.z;
                $scope.direction.old.x = $scope.direction.x;
                sendDirection();
            }

            //Auto-calibration
            if ($scope.direction.x === 'stop') {
                if (++$scope.stop.tmpCounter.x > $scope.stop.countLimit.x) {
                    $scope.stop.tmpCounter.x = 0;
                    $scope.stop.x = $scope.rotation.accelerometer.x;
                }
            } else {
                $scope.stop.tmpCounter.x = 0;
            }

            if ($scope.direction.z === 'stop') {
                if (++$scope.stop.tmpCounter.z > $scope.stop.countLimit.z) {
                    $scope.stop.tmpCounter.z = 0;
                    $scope.stop.z = $scope.rotation.accelerometer.z;
                }
            } else {
                $scope.stop.tmpCounter.z = 0;
            }
        }

        function onError(fusionError) {
            $scope.magnetometerError = 'error';
        };

        function sendDirection() {
            $.ajax({
                type: 'POST',
                url: $scope.url + '/orientation',
                data: $scope.direction,
                success: function (data) {
                },
                dataType: 'json',
                async: false
            });
        }

    }]);
