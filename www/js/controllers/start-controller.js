var application = angular.module('app');

application.controller('StartCtrl', ['$scope', '$state', '$rootScope',
    function ($scope, $state, $rootScope) {
        if (!$rootScope.host) {
            $rootScope.host = {url: 'http://192.168.1.36:3000'};
        }
        $rootScope.goBack = function () {
            $state.go('start')
        }
    }]);
