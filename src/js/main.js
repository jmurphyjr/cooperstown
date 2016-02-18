/**
 * Created by jack on 11/17/15.
 */
/* jshint node: true */
/* global: document */

'use strict';

var EventsEmitter = require('events');
var GoogleMaps = require('./google.js');
var ko = require('knockout');


var cooperstownFirebase = require('./firebaseInterface');
var cooperstownViewModel = require('./cooperstownModel');
// var searchBox = require('./searchBox');

var utils = require('./utils');
var weather = require('./weather');

var emitter = new EventsEmitter();


var Main = function() {

    var cooperstownVM;
    var googlePlacesSearch;
    // var cooperstownId = document.getElementById('body');
    // var searchBarId = document.getElementById('searchBar');
    // var placesListId = document.getElementById('places-list');
    var footer = document.getElementById('footer');

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
        console.log(data);
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
        cooperstownVM = new cooperstownViewModel();
        cooperstownFirebase.init(initialPlaceLoad, updatePlace);
        cooperstownVM.loadBindings();
        // searchBox.loadBindings(searchBarId);

    });

};

module.exports = Main;
