/**
 * Created by jack on 11/5/15.
 */
/* jshint node: true */
/* global google */
/* global document */

'use strict';

console.log('entered google.js');

var Q = require('q');

var _map;

// /**
//  * @description GoogleMaps is the interface for this application into the
//  * Google Maps Javascript API.
//  * @param {String} node The DOM element to attach the map to.
//  * @param {Object} options Accepts a google.maps.MapOptions object. See docs.
//  * @returns {GoogleMaps}
//  * @constructor
//  */
// var GoogleMaps = function() {
//     if ( !(this instanceof GoogleMaps) ) {
//         return new GoogleMaps();
//     }
//
//     /**
//      * defaultOptions represents the required parameters in order to initialize
//      * a google.maps.Map instance. The Map will default to the geographical
//      * center of the United States with a zoom level of 1.
//      *
//      * @type {{center: Window.google.maps.LatLng, zoom: number}}
//      */
//     this.defaultOptions = {
//         // Default to the center of the United States and a zoom level of 1.
//         center: { lat: 39.8282, lng: -98.5795 },
//         zoom: 1
//     };
//
// };
//
// GoogleMaps.prototype.map = undefined;
//
// GoogleMaps.prototype.initMap = function(node, options) {
//
//     if (typeof node === 'string') {
//         this.node = document.getElementById(node);
//     } else {
//         throw new TypeError('node must be of type string');
//     }
//
//     if (typeof options === 'object') {
//         this.options = utils.extend(this.defaultOptions, options);
//     } else {
//         this.options = this.defaultOptions;
//     }
//
//     this.map = new google.maps.Map(this.node, this.options);
// };
//
// GoogleMaps.prototype.getMap = function() {
//     return this.map;
// };
//
// GoogleMaps.prototype.addMarker = function(loc) {
//     // console.log(loc);
//     return new google.maps.Marker({
//         map: this.map,
//         position: new google.maps.LatLng(loc.location.latitude, loc.location.longitude),
//         title: loc.name,
//         // TODO: label does not animate with the marker dropping for now.
//         // label: { text: loc.category().toUpperCase() },
//         animation: google.maps.Animation.DROP
//     });
// };

var _coopersTown;  // openweathermap.org id 5113664

var maps = {

    /**
     * Default google.maps.Map options for this applicaiton
     */
    options: {},

    contextMenu: null,

    element: undefined,

    setElement: function( element ) {

        maps.element = document.getElementById(element);
    },

    setOptions: function() {
        maps.options = {
            center: new google.maps.LatLng(42.6638889, -74.954252),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoom: 11,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_CENTER
            },
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            scaleControl: true,
            streetViewControl: false,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            }
        };
    },

    loadMap: function(element) {
        maps.setElement(element);
        maps.setOptions();
        _map = new google.maps.Map(maps.element, maps.options);
        maps.DistanceService.init();
        _coopersTown = new google.maps.LatLng(42.63999, -74.96033);
        maps.PlacesService.init();
        maps.contextMenu = google.maps.event.addListener(
            _map,
            'rightclick',
            function(event) {
                console.log(event);
            }
        );
    },

    getMap: function() {
        return _map;
    },

    setDefaultZoomAndCenter: function() {
        _map.setZoom(11);
        _map.setCenter(_coopersTown);
    },

    DistanceService: {
        _distanceService: '',

        init: function() {
            maps.DistanceService._distanceService = new google.maps.DistanceMatrixService();
        },

        distanceToCooperstownPark: function(destination) {
            var deferred = Q.defer();

            maps.DistanceService._distanceService.getDistanceMatrix({
                origins: [destination],
                destinations: [ _coopersTown ],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.IMPERIAL
            }, function(response, status) {
                if (status === google.maps.DistanceMatrixStatus.OK) {
                    var distance = maps.DistanceService.distanceResult(response);
                    // deferred.resolve(response);
                    deferred.resolve(distance);
                }
                else {
                    deferred.reject(status);
                }
            });

            return deferred.promise;
        },

        distanceResult: function(data) {
            if (data.rows[0].elements[0].status === 'OK') {
                return data.rows[0].elements[0].distance.text;
            }
            else {
                return undefined;
            }
        }
    },

    PlacesService: {
        _placesService: '',

        init: function() {
            maps.PlacesService._placesService = new google.maps.places.PlacesService(_map);
            // maps.PlacesService._placesService = new google.maps.places.AutocompleteService();
        },

        autoCompleteService: function(search) {
            var deferred = Q.defer();

            if (search === '') {
                deferred.resolve([]);
            }
            else {
                maps.PlacesService._placesService.nearbySearch( {
                    location: _coopersTown,
                    radius: 20234,
                    name: search
                }, function(results, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // console.log(results);
                        deferred.resolve(results);
                    }
                    else {
                        console.log(status);
                        deferred.resolve([]);
                    }
                });
            }
            return deferred.promise;
        },

        /**
         *
         * @param input An array of google.maps.places.PlaceResult
         *
         */
        placeResult: function(input) {

            var length = input.length;
            var results = [];

            for (var i = length - 1; i >= 0; i--) {
                // console.log(input[i]);
                var temp = {};
                temp.id = undefined;
                temp.name = input[i].name;
                temp.description = undefined;
                temp.id = input[i].place_id;
                temp.icon = input[i].icon;
                temp.location = input[i].geometry.location;
                temp.address = '';
                temp.distanceToDreamsPark = undefined;
                // console.log(temp);
                results.push(temp);
            }

            return results;
        }
    },

    MarkerService: {
        markers: {},

        iconUrl: 'http://maps.google.com/mapfiles/kml/paddle/',

        iconMapping: {
            'restaurant': 'red-circle.png',
            'lodging': 'blu-circle.png',
            'sites': 'ylw-circle.png'
        },

        addMarker: function(name, location, locationtype, curated) {

            if (curated === undefined) {
                curated = false;
            }

            // If Marker already exists, then exit
            if (maps.MarkerService.markerExist(name)) {
                console.log(name + 'already exists in markers list');
            }
            else {
                var icon = maps.MarkerService.iconUrl + maps.MarkerService.iconMapping[locationtype];

                var marker = new google.maps.Marker({
                    map: _map,
                    opacity: 1.0,
                    position: new google.maps.LatLng(location.lat(), location.lng()),
                    title: name,
                    icon: icon,
                    // TODO: label does not animate with the marker dropping for now.
                    // label: { text: loc.category().toUpperCase() },
                    animation: google.maps.Animation.DROP
                });

                maps.MarkerService.markers[name] = {
                    marker: marker,
                    stored: curated
                };
            }
        },

        allVisible: function() {
            for (var key in maps.MarkerService.markers) {
                if (maps.MarkerService.markerExist(key)) {
                    var value = maps.MarkerService.markers[key];
                    value.marker.setVisible(true);
                }
            }
        },

        markerExist: function(name) {
            var alreadyExists = false;
            if (maps.MarkerService.markers.hasOwnProperty(name)) {
                alreadyExists = true;
            }
            return alreadyExists;
        },

        removeMarker: function(name) {
            // If marker exists, then delete
            if (maps.MarkerService.markerExist(name)) {
                delete maps.MarkerService.markers[name];
            }
        },

        animateMarker: function(name) {
            if (maps.MarkerService.markerExist(name)) {
                var thisMarker = maps.MarkerService.markers[name];
                thisMarker.marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }
    }

};

// module.exports = new GoogleMaps();

module.exports = maps;

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
