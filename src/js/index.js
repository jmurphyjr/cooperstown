/* jshint node: true */
'use strict';

/**
 * The entry point for the cooperstown app.
 *
 */

/**
 * Event emitter used to notify various parts of the project all data is loaded as required.
 */
var EventEmitter = require('events');
var emitter = new EventEmitter();


var ko = require('knockout');
var gMaps = require('./google.js');
var utils = require('./utils.js');
var PlacesViewModel = require('./places.js');

var el = document.getElementById('map');

/**
 * Google Maps API is being loaded by index.html via  script tag. The script tag
 * has the async attribute set. Before attempting any google.maps specific functionality
 * need to verify google exists on the window object.
 */
utils.loadScript('google', function(result) {
    if (result === 'success') {
        // google.maps is loaded, add map to the canvas.
        gMaps.addMapToCanvas(el);
        // Emit event to indicate to all listeners all map operations may proceed.
        emitter.emit('googlemapsloaded');
    }
    else if (result === 'timeout') {
        // TODO: Implement functionality to handle a timeout, perhaps just continue
        //       trying to connect to the service.
        console.log('Google Maps API did not load in 20 seconds, running in degraded state');
    }
});

/**
 * Instantiate PlacesViewModel and applyBindings
 */
ko.applyBindings(new PlacesViewModel(emitter));
