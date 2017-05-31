var application = angular.module('app');

application.controller('StartCtrl', ['$scope', '$state', '$rootScope',
    function ($scope, $state, $rootScope) {

        $scope.host = {
            url: 'http://192.168.43.223:3000',
            port: 3000,
            ip: '192.168.43.223'
        };
        $scope.$watch('host.ip', function () {
            localStorage.setItem('host', 'http://' + $scope.host.ip + ':' + $scope.host.port);
        });
        $scope.$watch('host.port', function () {
            localStorage.setItem('host', 'http://' + $scope.host.ip + ':' + $scope.host.port);
        });

        if (!localStorage.getItem('host')) {
            localStorage.setItem('host', $scope.host);
        }
        $rootScope.goBack = function () {
            $state.go('start')
        }
    }]);
