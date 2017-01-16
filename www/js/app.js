/**
 * Created by r00fi0 on 6/10/16.
 */
var app = angular.module('app', ['ionic','ui.router']);

app.config(function ($stateProvider, $urlRouterProvider) {
    

    $stateProvider
        .state('start', {
            url: '/start',
            templateUrl: 'index.html',
            controller: 'StartCtrl',
            cache: false
        }).state('sensors', {
        url: '/sensors',
        templateUrl: 'templates/sensors.html',
        controller: 'SensorsCtrl',
        cache: false
    }).state('slide', {
        url: '/slide',
        templateUrl: 'templates/slide.html',
        controller: 'SlideCtrl',
        cache: false
    }).state('orientation', {
        url: '/orientation',
        templateUrl: 'templates/device-orientation.html',
        controller: 'DeviceOrientationCtrl',
        cache: false
    });
    
});
