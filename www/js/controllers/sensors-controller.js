/**
 * Created by r00fi0 on 12/22/16.
 */
var application = angular.module('app');

var accelerometer = {};
accelerometer.stop = {};
accelerometer.sensivity = {};
accelerometer.sensivity.x = 20000;
accelerometer.sensivity.y = 20000;
accelerometer.sensivity.z = 20000;

application.controller('SensorsCtrl', ['$scope', '$state', '$rootScope', '$timeout', 'accelerometerService',
    function ($scope, $state, $rootScope, $timeout, accelerometerService) {

        $scope.acceleration = {};

        $scope.calibrateSensors = function () {
            $timeout(function () {
                accelerometer.stop.z = $scope.acceleration.z;
                accelerometer.stop.x = $scope.acceleration.x;
                accelerometer.stop.y = $scope.acceleration.y;
                $rootScope.$applyAsync();
                var audio = new Audio('sounds/calibration_complete.mp3')
                audio.volume = 1;
                audio.play();
            }, 2000)
        };

        if (window.screen.lockOrientation) {
            window.screen.lockOrientation('portrait');
        }


        function sendData() {
            var data = {
                ax: $scope.acceleration.x,
                ay: $scope.acceleration.y,
                az: $scope.acceleration.z,
                aT: $scope.acceleration.timestamp,
                side: 'left'
            };

            $.ajax({
                type: 'POST',
                url: $rootScope.host.url + '/orientation/accelerometer',
                data: data,
                success: function (data) {
                },
                dataType: 'json',
                async: false
            });

        }

        function onError() {
            alert('onError!');
        }

        var options = {frequency: 40};  // Update every 3 seconds

        navigator.accelerometer.watchAcceleration(detectShake, onError, options);


//для более стабильной работы - использовать два смартфона и считывать наклон с ноги которая не в движении
        function detectShake(acceleration) {
            $scope.acceleration.x = Math.round(acceleration.x * 10000);
            $scope.acceleration.y = Math.round(acceleration.y * 10000);
            $scope.acceleration.z = Math.round(acceleration.z * 10000);
            $scope.acceleration.timestamp = acceleration.timestamp;

            $rootScope.$applyAsync();

            // if ($scope.acceleration.x > accelerometer.stop.x + accelerometer.sensivity.x ||
            //     $scope.acceleration.x < accelerometer.stop.x - accelerometer.sensivity.x ||
            //     $scope.acceleration.y > accelerometer.stop.y + accelerometer.sensivity.y ||
            //     $scope.acceleration.y < accelerometer.stop.y - accelerometer.sensivity.y ||
            //     $scope.acceleration.z > accelerometer.stop.z + accelerometer.sensivity.z ||
            //     $scope.acceleration.z < accelerometer.stop.z - accelerometer.sensivity.z
            // ) {
                sendData();
            // }


        }

    }]);
