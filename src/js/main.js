/**
 * Created by jack on 11/17/15.
 */
/* jshint node: true */
/* global: document */

'use strict';

var EventsEmitter = require('events');
var GoogleMaps = require('./google.js');


var cooperstownFirebase = require('./firebaseInterface');
var cooperstownList = require('./cooperstownModel');
var searchBox = require('./searchBox');
var gPlacesSearch = require('./googlePlacesAutoComplete');

var utils = require('./utils');

var emitter = new EventsEmitter();

var Main = function() {

    var test;
    var cooperstownId = document.getElementById('cooperstown-list');
    var searchBarId = document.getElementById('searchBar');
    var placesListId = document.getElementById('places-list');

    /**
     * Function to load initial data set, as well as update on additions or changes.
     * @param data
     */
    function initialPlaceLoad(data) {

        if (data.val() !== null) {
        data.forEach(function(e) {
            cooperstownList.loadSavedPlaces(e.val());
        });
        }
    }

    function updatePlace(data) {

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
        cooperstownFirebase.init(initialPlaceLoad, updatePlace);
        cooperstownList.loadBindings(cooperstownId);
        searchBox.loadBindings(searchBarId);
        test = new gPlacesSearch();
        test.loadBindings(placesListId);

    });

};

module.exports = Main;
