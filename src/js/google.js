/**
 * Created by jack on 11/5/15.
 */
/* jshint node: true */
/* global google */

'use strict';

console.log('entered google.js');

var $ = require('jquery');  // jshint ignore:line

/**
 * @description GoogleMaps is the interface for this application into the
 * Google Maps Javascript API.
 * @param {String} node The DOM element to attach the map to.
 * @param {Object} options Accepts a google.maps.MapOptions object. See docs.
 * @returns {GoogleMaps}
 * @constructor
 */
var GoogleMaps = function(node, options) {
    if ( !(this instanceof GoogleMaps) ) {
        return new GoogleMaps(node, options);
    }

    /**
     * defaultOptions represents the required parameters in order to initialize
     * a google.maps.Map instance. The Map will default to the geographical
     * center of the United States with a zoom level of 1.
     *
     * @type {{center: Window.google.maps.LatLng, zoom: number}}
     */
    var defaultOptions = {
        // Default to the center of the United States and a zoom level of 1.
        center: new google.maps.LatLng(39.8282, -98.5795),
        zoom: 1
    };

    if (typeof node === 'string') {
        this.node = document.getElementById(node);
    } else {
        throw new TypeError('node must be of type string');
    }

    if (typeof options === 'object') {
        this.options = $.extend({}, defaultOptions, options);
    } else {
        this.options = defaultOptions;
    }
    console.log(this.options);
};

GoogleMaps.prototype.map = undefined;

GoogleMaps.prototype.distanceService = undefined;

GoogleMaps.prototype.placesService = undefined;

GoogleMaps.prototype.initMap = function() {
    this.map = new google.maps.Map(this.node, this.options);
    // this.placesService = new google.maps.places.PlacesService(this.map);
    // this.placesService = new GooglePlacesSearch(this.map);
};

GoogleMaps.prototype.getMap = function() {
    return this.map;
};

module.exports = GoogleMaps;
// {
//
//     // return {
//     addMapToCanvas: function (mapCanvas) {
//         console.log('executing addMapToCanvas()');
//         var myOptions = {
//             // center: new google.maps.LatLng(42.6972, -74.9269),
//             center: new google.maps.LatLng(mapCenter.location.latitude,
//                 mapCenter.location.longitude),
//             zoom: 11,
//             mapTypeId: google.maps.MapTypeId.ROADMAP,
//             mapTypeControl: true,
//             mapTypeControlOptions: {
//                 style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
//                 position: google.maps.ControlPosition.TOP_CENTER
//             },
//             zoomControl: true,
//             zoomControlOptions: {
//                 position: google.maps.ControlPosition.RIGHT_TOP
//             },
//             scaleControl: true,
//             streetViewControl: false,
//             streetViewControlOptions: {
//                 position: google.maps.ControlPosition.RIGHT_CENTER
//             }
//         };
//         map = new google.maps.Map(mapCanvas, myOptions);
//         console.log(typeof map);
//         distanceService = new google.maps.DistanceMatrixService();
//         placesService = new google.maps.places.PlacesService(map);
//     },
//     /**
//      * @describe Adds marker to the map and saves it to the marker attribute
//      * @param loc A Place item.
//      */
//     addMarker: function (loc) {
//         var location = null;
//         var inwin = new google.maps.InfoWindow();
//
//         // console.log(googleLoaded());
//         if (!googleLoaded()) {
//             console.log('addMarker returned undefined');
//             return undefined;
//         }
//         location = loc.location.getLocation();
//
//         loc.marker = new google.maps.Marker({
//             map: map,
//             position: new google.maps.LatLng(location.lat, location.long),
//             title: loc.name(),
//             // TODO: label does not animate with the marker dropping for now.
//             // label: { text: loc.category().toUpperCase() },
//             animation: google.maps.Animation.DROP
//         });
//
//         google.maps.event.addListener(loc.marker, 'click', function() {
//             inwin.setContent(loc.content);
//             inwin.open(map, this);
//         });
//     },
//     getMap: function () {
//         return map;
//     },
//
//     /**
//      * @describe Sets Marker Animation to null
//      * @param m A Marker attribute.
//      */
//     clearMarkerAnimation: function (m) {
//         if (!googleLoaded()) {
//             return undefined;
//         }
//         m.setAnimation(null);
//     },
//
//     animateMarker: function (m) {
//         if (!map.getBounds().contains(m.marker.getPosition())) {
//             map.setCenter(m.marker.getPosition());
//         }
//         m.marker.setAnimation(google.maps.Animation.BOUNCE);
//     },
//     /**
//      *
//      * @param dp The Dreams Park Marker
//      * @param other The marker we want the distance to.
//      */
//     distanceToDreamsPark: function(dp, other, callback) {
//         // console.log(dp);
//         // console.log(other);
//         distanceService.getDistanceMatrix({
//             origins: [dp.marker.getPosition()],
//             destinations: [other.marker.getPosition()],
//             travelMode: google.maps.TravelMode.DRIVING,
//             unitSystem: google.maps.UnitSystem.IMPERIAL
//         }, function(response, status) {
//             if (status !== google.maps.DistanceMatrixStatus.OK) {
//                 callback(undefined);
//             }
//             else {
//                 callback(response);
//             }
//         });
//     },
//
//     queryPlaces: function(place, callback) {
//         var loc = new google.maps.LatLng(mapCenter.location.latitude,
//             mapCenter.location.longitude);
//
//         var request = {
//             location: loc,
//             radius: 32000,
//             // textSearch field
//             query: place,
//             // radarSearch field
//             name: place
//         };
//         placesService.nearbySearch(request, function(results, status) {
//             if (status === google.maps.places.PlacesServiceStatus.OK) {
//                 console.log('Results from textSearch for ' + request.name);
//                 console.log(results);
//
//                 var detailReq = { placeId: results[0].place_id };
//                 placesService.getDetails(detailReq, function(place, status) {
//                 if (status == google.maps.places.PlacesServiceStatus.OK) {
//                         console.log('Results from getDetails');
//                         console.log(place);
//                     }
//                 });
//             }
//             else {
//                 if (status === 'ZERO_RESULTS') {
//                     console.log('No results found for ' + request.name);
//                 }
//                 else {
//                     console.log(request.name + ': ' + status);
//                 }
//             }
//         });
//     }
//
// };
