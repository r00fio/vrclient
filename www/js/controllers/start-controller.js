var application = angular.module('app');

application.controller('StartCtrl', ['$scope', '$state', '$rootScope',
    function ($scope, $state, $rootScope) {
        
        $scope.host = {url: 'http://192.168.0.100:3000'};
        $scope.$watch('host.url', function() {
            localStorage.setItem('host', $scope.host.url);
        });

        if (!localStorage.getItem('host')) {
            localStorage.setItem('host', $scope.host);
        }
        $rootScope.goBack = function () {
            $state.go('start')
        }
    }]);
