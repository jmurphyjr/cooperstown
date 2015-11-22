/**
 * Created by jack on 11/17/15.
 */
/* jshint node: true */

'use strict';

var $ = require('jquery');
var EventsEmitter = require('events');

var GoogleMaps = require('./google.js');
var GooglePlacesSearch = require('./googlePlacesSearch.js');
var GoogleMarkers = require('./googleMarkers.js');

var places = require('./placesModel.js');
var searchBox = require('./searchBox.js');

var Firebase = require('./firebaseInterface.js');
var utils = require('./utils.js');

var emitter = new EventsEmitter();

var gMaps;
var gSearch;
var Places = new places();
var SearchBox = new searchBox();
var gMarker;

function Main() {

    var marker = $('#markers')[0];
    var searchBar = $('#searchBar')[0];

    LoadGoogleMaps();

    emitter.on('placeAdded', function() {
        console.log(Places.places());
    });


    emitter.on('googlemapsloaded', function() {
        gMarker = new GoogleMarkers(gMaps.getMap());
        Firebase.init(InitialPlacesLoad, GetData);
        gSearch = new GooglePlacesSearch(gMaps.getMap());
        console.log('Google Maps are Loaded');
    });

    Places.loadBindings(marker);
    SearchBox.loadBindings(searchBar);
}

/**
 * This function is called when the Firebase connection initially receives data.
 * then is no longer used once complete.
 * @param data
 * @constructor
 */
function InitialPlacesLoad(data) {
    data.forEach(function(place) {
        gSearch.nearby(place.val().name)
            .then(
                // On Success
                function(resp) {
                    // console.log(resp);
                    if (resp !== undefined) {
                        // location found via Google nearby search. Get the detail
                        var place_id = resp[0].place_id;
                        return gSearch.detailSearch(place_id);
                    }
                    else {
                        // location was not found via nearby Search
                        // Therefore, create Place with information provided
                        Places.loadModel(place.val());
                        return $.Deferred().reject('No results returned for ' + place.val().name);
                    }
                },
                // On Error
                function(error) {
                    console.log(error);
                }
            )
            .then(
                // On Success
                function(detail) {
                    // console.log(detail);
                    Places.loadModel(place.val());
                },
                // On Error
                function(error) {
                    console.log(error);
                }
            );
        // console.log(place.val());
        // Places.loadModel(place.val());
    });
    emitter.emit('placeAdded');

    // Places.loaded(true);
}

/**
 * This function is used
 * @param data
 * @constructor
 */
function GetData(data) {
    var val = data.val();

    if (Places.loaded()) {
        gSearch.nearby(val.name)
            .then(function(resp) {
                }
            );

        Places.loadModel(val);
        emitter.emit('placeAdded');
    }
}

function LoadGoogleMaps() {
    utils.loadScript('google', function(result) {
        if (result === 'success') {
            console.log('google maps should be loaded');
            gMaps = new GoogleMaps('map', {
                zoom: 11,
                center: { lat: 42.6638889, lng: -74.954252 }
            });

            emitter.emit('googlemapsloaded');
        }
        else if (result === 'timeout') {
            // TODO: Implement functionality to handle a timeout, perhaps just
            // continue trying to connect to the service.
            console.log('Google Maps API did not load in 20 seconds, ' +
                'running in degraded state');
        }
    });

}

module.exports = Main;
