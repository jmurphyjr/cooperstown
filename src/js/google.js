/**
 * Created by jack on 11/5/15.
 */
/* jshint node: true */
/* global google */
/* global document */

'use strict';
// var CustomOverlay = require('./customoverlay');

console.log('entered google.js');
var _map;

var _infoWindow;  // The single inforWindow.

var _coopersTown;  // openweathermap.org id 5113664

var _initialMapBounds;

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
        // _infoWindow = new google.maps.InfoWindow();
        var CustomOverlay = require('./customoverlay');
        _infoWindow = new CustomOverlay();

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
        _initialMapBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(42.50969783834314, -75.29208158984375),
            new google.maps.LatLng(42.81769848711016, -74.61642241015625));
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

            return new Promise(function(resolve, reject) {
                maps.DistanceService._distanceService.getDistanceMatrix({
                    origins: [destination],
                    destinations: [ _coopersTown ],
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: google.maps.UnitSystem.IMPERIAL
                }, function(response, status) {
                    if (status === google.maps.DistanceMatrixStatus.OK) {
                        var distance = maps.DistanceService.distanceResult(response);
                        resolve(distance);
                    }
                    else {
                        reject(status);
                    }
                });
            });
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

        /**
         * @description Uses the Google Places Nearby Search to return a list of Places
         * matching the search string.
         * @param {String} search Term to search for
         * @returns {promise}
         */
        autoCompleteService: function(search) {
            return new Promise(function(resolve, reject) {
                if (search === '') {
                    resolve([]);
                }
                else {
                    maps.PlacesService._placesService.nearbySearch({
                        location: _coopersTown,
                        // name: search,
                        keyword: search,
                        rankBy: google.maps.places.RankBy.DISTANCE
                    }, function (results, status, pagination) {
                        var rtnData;
                        rtnData = maps.PlacesService.placeResult(results, status, pagination);
                        console.log(rtnData);
                        resolve(rtnData);

                    });
                }
            });
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
         *
         * @param results
         * @param status
         * @param pagination
         */
        placeResult: function(results, status, pagination) {

            var length = results.length;
            var rtnPlaces = [];

            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return rtnPlaces;
            }
            else {
                console.log(results);
                for (var i = length - 1; i >= 0; i--) {

                    console.log(results[i].geometry.location.toString());
                    if (_initialMapBounds.contains(results[i].geometry.location)) {
                        maps.DistanceService.distanceToCooperstownPark(results[i].geometry.location)
                            .then(function(distance) {
                               console.log(distance);
                            });

                        console.log('outside then');
                        var temp = {};
                        temp.id = undefined;
                        temp.name = results[i].name;
                        temp.description = undefined;
                        temp.id = results[i].place_id;
                        temp.icon = results[i].icon;
                        temp.location = results[i].geometry.location;
                        temp.address = '';
                        temp.distanceToDreamsPark = undefined;

                        // Set Category based on Google Places Types
                        temp.category = maps.PlacesService.setCategory(results[i]);
                        // console.log(temp);
                        rtnPlaces.push(temp);
                    }
                }
                var moreResultsButton = document.getElementById('btn-places');
                var handler = function() {
                    // var moreResultsButton = document.getElementById('btn-places');
                    moreResultsButton.disabled = true;
                    pagination.nextPage();
                };

                if (pagination.hasNextPage) {

                    moreResultsButton.disabled = false;

                    moreResultsButton.addEventListener('click', handler); // function() {
                    //     moreResultsButton.disabled = true;
                    //     pagination.nextPage();
                    // });
                }
                else {
                    moreResultsButton.disabled = false;
                    moreResultsButton.removeEventListener('click', handler);
                }
            }
            return rtnPlaces;
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

                // Make sure Marker is visible on the map, if set center and zoom to initial value
                if (!_map.getBounds().contains(marker.getPosition())) {
                    maps.setDefaultZoomAndCenter();
                }
                google.maps.event.addListener(marker, 'click', function() {
                    _infoWindow.setContent('<p>' + name + '</p>');
                    _infoWindow.open(_map, marker);
                }.bind(marker));

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
            _infoWindow.close();

            if (maps.MarkerService.markerExist(name)) {
                var thisMarker = maps.MarkerService.markers[name];
                _infoWindow.setContent('<p>' + name + '</p>');
                _infoWindow.open(_map, thisMarker.marker);
                _map.setCenter(thisMarker.marker.getPosition());
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

module.exports = maps;
