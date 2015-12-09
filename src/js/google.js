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
                }, function(results, status, pagination) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        console.log(results);
                        console.log(pagination);
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

        setCategory: function(place) {
            var food = ['restaurant', 'bar', 'cafe', 'food', 'grocery_or_supermarket', 'bakery'];
            var lodging = ['lodging'];
            var fun = ['amusement_park', 'aquarium', 'art_gallery', 'bowling_alley', 'casino',
                'movie_theater', 'museum', 'night_club', 'park', 'zoo'];
            var response = false;


            if (place.types.indexOf('lodging') > -1) {
                response = 'lodging';
            }

            if (!response) {
                food.forEach(function(f) {
                    if (place.types.indexOf(f) > -1) {
                        response = 'restaurant';
                    }
                });
            }

            if (!response) {
                fun.forEach(function(f) {
                    if (place.types.indexOf(f) > -1) {
                        response = 'fun';
                    }
                });
            }

            if (!response) {
                response = 'general';
            }

            // Set Category for specific places to 'baseball'
            if (place.name === 'Cooperstown Dreams Park' ||
                place.name === 'National Baseball Hall of Fame and Museum' ||
                place.name === 'Doubleday Field') {
                response = 'baseball';
            }

            return response;
        },

        /**
         *
         * @param input An array of google.maps.places.PlaceResult
         *
         */
        placeResult: function(input) {

            var length = input.length;
            var results = [];
            var t; // Variable to hold the types for this location.

            for (var i = length - 1; i >= 0; i--) {
                var temp = {};
                temp.id = undefined;
                temp.name = input[i].name;
                temp.description = undefined;
                temp.id = input[i].place_id;
                temp.icon = input[i].icon;
                temp.location = input[i].geometry.location;
                temp.address = '';
                temp.distanceToDreamsPark = undefined;

                // Set Category based on Google Places Types
                temp.category = maps.PlacesService.setCategory(input[i]);
                // console.log(temp);
                results.push(temp);
            }

            return results;
        }
    },

    MarkerService: {
        markers: {},

        // iconUrl: 'http://maps.google.com/mapfiles/kml/paddle/',

        iconMapping: {
            'restaurant': 'http://maps.google.com/mapfiles/kml/paddle/red-circle.png',
            'lodging': 'http://maps.google.com/mapfiles/kml/paddle/blu-circle.png',
            'fun': 'http://maps.google.com/mapfiles/kml/paddle/ylw-circle.png',
            'baseball': 'images/baseball.png',
            'general': 'http://maps.google.com/mapfiles/kml/paddle/purple-circle.png'
        },

        addMarker: function(name, location, locationtype, curated) {

            if (curated === undefined) {
                curated = false;
            }
            // If Marker already exists, then exit
            if (maps.MarkerService.markerExist(name)) {
                console.log(name + ' already exists in markers list');
            }
            else {
                // maps.MarkerService.removeAllMarkers();
                var catIcon = maps.MarkerService.iconMapping[locationtype];

                var image = {
                    url: catIcon,
                    scaledSize: new google.maps.Size(30, 30)
                };


                var marker = new google.maps.Marker({
                    map: _map,
                    opacity: 1.0,
                    position: new google.maps.LatLng(location.lat(), location.lng()),
                    title: name,
                    icon: image,
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

        setVisible: function(name, visible) {
            console.log(name + ': ' + visible);
            if (maps.MarkerService.markerExist(name)) {
                maps.MarkerService.markers[name].marker.setVisible(visible);
            }
        },

        markerExist: function(name) {
            var alreadyExists = false;
            if (maps.MarkerService.markers.hasOwnProperty(name)) {
                alreadyExists = true;
            }
            return alreadyExists;
        },

        /**
         * @description removes a single or an array of markers from the map
         * @param {Array} name Locations to Remove from the Map.
         */
        removeMarker: function(name) {

            if (Object.prototype.toString.call(name) === '[object Array]') {
                console.log('name is array');
            }
            else if (Object.prototype.toString.call(name) === '[object String]') {
                console.log('name is a string');
            }

            // If marker exists and NOT curated, then delete
            if (maps.MarkerService.markerExist(name) && !maps.MarkerService.markers[name].stored) {
                maps.MarkerService.markers[name].marker.setMap(null);
                delete maps.MarkerService.markers[name];
            }
        },

        removeAllMarkers: function() {
            for (var key in maps.MarkerService.markers) {
                if (!maps.MarkerService.markers[key].stored) {
                    maps.MarkerService.markers[key].marker.setMap(null);
                    delete maps.MarkerService.markers[key];
                }
            }
        },

        /**
         * @description terminates animation for all markers
         */
        terminateAnimation: function() {
            for (var key in maps.MarkerService.markers) {
                maps.MarkerService.markers[key].marker.setAnimation(null);
            }
        },

        /**
         * @description Animates the specified Marker
         * @param name
         */
        animateMarker: function(name) {
            maps.MarkerService.terminateAnimation();

            if (maps.MarkerService.markerExist(name)) {
                var thisMarker = maps.MarkerService.markers[name];
                thisMarker.marker.setAnimation(google.maps.Animation.BOUNCE);

                (function() {
                    var markerContext = thisMarker.marker;
                    setTimeout(function() {
                        markerContext.setAnimation(null);
                    }, 2000);
                })();
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
