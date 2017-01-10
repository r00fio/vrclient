/**
 * Created by r00fi0 on 12/23/16.
 */
application.controller('SlideCtrl', ['$scope', '$state', '$rootScope', '$timeout',
    function ($scope, $state, $rootScope, $timeout) {


        // var host = "http://192.168.0.106";
        // var host = "http://192.168.0.108";
        var host = "http://192.168.0.101";
        // var host = "http://172.17.1.9";
        // var host = "http://192.168.1.34 ";
        var touchStartsURL = host + ":3000/messages/touchstart";
        var touchMoveURL = host + ":3000/messages/touches";
        var touchEndsURL = host + ":3000/messages/touchend";
        var mouseClickURL = host + ":3000/messages/mouseclick";

        document.addEventListener("volumedownbutton", onVolumeDownKeyDown, false);
        function sendVolumeControls(button) {
            $.post(mouseClickURL, {button:button}, function (data) {
            });
        }
        function onVolumeDownKeyDown() {
            sendVolumeControls('right');
        }

        document.addEventListener("volumeupbutton", onVolumeUpKeyDown, false);

        function onVolumeUpKeyDown() {
            sendVolumeControls('left');
        }
        document.addEventListener("touchstart", touchStartFunc, true);//?misspelled
        document.addEventListener("touchmove", touchmoveFunc, true);
        document.addEventListener("touchend", touchEndFunc, true);

        var startCoordinate = {x: 0, y: 0};

        function touchStartFunc(e) {
            var y = e.touches[0].clientY;
            var x = e.touches[0].clientX;
            startCoordinate.x = Number(x);
            startCoordinate.y = Number(y);
            $.ajax({
                type: 'POST',
                url: touchStartsURL,
                data: {x: x, y: y},
                success: function () {
                },
                dataType: 'json',
                async: false
            });
        }

        function touchmoveFunc(e) {
            if (navigator.userAgent.match(/Android/i)) //stupid android bug cancels touch move if it thinks there's a swipe happening
            {
                e.preventDefault();
            }
            var newCoord = {};

            var x = e.touches[0].clientX;
            var y = e.touches[0].clientY;
            newCoord.x = Number(x);
            newCoord.y = Number(y);
            document.getElementById("userX").innerHTML = x;
            document.getElementById("userY").innerHTML = y;

            var step = 4;
            var stepX = 18;

            function postCoordinates(x, y) {
                $.ajax({
                    type: 'POST',
                    url: touchMoveURL,
                    data: {x: x, y: y},
                    success: function () {
                    },
                    dataType: 'json',
                    async: false
                });
            }

            if (newCoord.y > startCoordinate.y + step) {
                startCoordinate.y = newCoord.y;
                postCoordinates(x, y);
            } else if (newCoord.y < startCoordinate.y - step) {
                startCoordinate.y = newCoord.y;
                postCoordinates(x, y);
            }
            if (newCoord.x > startCoordinate.x + stepX) {
                startCoordinate.x = newCoord.x;
                postCoordinates(x, y);
            } else if (newCoord.x < startCoordinate.x - stepX) {
                startCoordinate.x = newCoord.x;
                postCoordinates(x, y);
            }
        }

        function touchEndFunc(e) {

            startCoordinate.x = Number(e.pageX);
            startCoordinate.y = Number(e.pageY);
            console.log('touch end')
            $.ajax({
                type: 'POST',
                url: touchEndsURL,
                data: {x: e.pageX, y: e.pageY},
                success: function () {
                },
                dataType: 'json',
                async: false
            });
        }


    }]);
