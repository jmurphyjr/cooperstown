/**
 * Created by jack on 11/17/15.
 */
/* jshint node: true */
/* global: document */

'use strict';

var EventsEmitter = require('events');

var cooperstownFirebase = require('./firebaseInterface');
var cooperstownList = require('./cooperstownModel');
var searchBox = require('./searchBox');
var utils = require('./utils');

var GoogleMaps = require('./google.js');

var emitter = new EventsEmitter();

var Main = function() {

    var cooperstownId = document.getElementById('cooperstown-list');
    var searchBarId = document.getElementById('searchBar');

    /**
     * Function to load initial data set, as well as update on additions or changes.
     * @param data
     */
    function dataProcess(data) {
        cooperstownList.addPlace(data.val());
    }

    utils.loadScript('google', function(result) {
        if (result === 'success') {
            console.log('google maps should be loaded');
            GoogleMaps.loadMap('map');
            emitter.emit('googlemapsloaded');
        }
        else if (result === 'timeout') {
            // TODO: Implement functionality to handle a timeout, perhaps just
            // continue trying to connect to the service.
            console.log('Google Maps API did not load in 20 seconds, ' +
                'running in degraded state');
        }
    });

    emitter.on('googlemapsloaded', function() {
        cooperstownFirebase.init(dataProcess);

    });

    cooperstownList.loadBindings(cooperstownId);
    searchBox.loadBindings(searchBarId);
};

module.exports = Main;
