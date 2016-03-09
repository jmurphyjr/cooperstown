/**
 * Created by jack on 11/17/15.
 */
/* jshint node: true */
/* global: document */

'use strict';

var EventsEmitter = require('events');
var GoogleMaps = require('./google.js');

var cooperstownFirebase = require('./firebaseInterface');
var CooperstownViewModel = require('./cooperstownModel');
// var searchBox = require('./searchBox');

var utils = require('./utils');

var emitter = new EventsEmitter();


var Main = function() {

    var cooperstownVM;

    /**
     * Function to load initial data set, as well as update on additions or changes.
     * @param data
     */
    function initialPlaceLoad(data) {

        if (data.val() !== null) {
            data.forEach(function(e) {
                cooperstownVM.loadSavedPlaces(e.val());
            });
        }
    }

    function updatePlace(data) {
        if (data.val() !== null) {
            cooperstownVM.loadSavedPlaces(data.val());
        }
    }

    utils.loadScript('google', function(result) {
        if (result === 'success') {
            GoogleMaps.loadMap('map');
            emitter.emit('googlemapsloaded');
        }
        else if (result === 'timeout') {
            // TODO: Implement functionality to handle a timeout, perhaps just
            // continue trying to connect to the service.
            var map = document.getElementById('map');
            map.innerHTML = '<div class="map-load-error"><h1>Well that is embarrassing</h1><p>Google Maps API did not load within 20 seconds. Please reload</p></div>';
            console.log('Google Maps API did not load in 20 seconds, ' +
                'running in degraded state');
        }
    });

    emitter.on('googlemapsloaded', function() {
        cooperstownVM = new CooperstownViewModel();
        cooperstownFirebase.init(initialPlaceLoad, updatePlace);
        cooperstownVM.loadBindings(1);

    });

};

module.exports = Main;
