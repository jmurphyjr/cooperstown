/**
 * Created by jack on 11/5/15.
 */
/* jshint node: true */
/* global google */
/* global document */
/* global Promise */

'use strict';
// var CustomOverlay = require('./customoverlay');

var _map;

var _infoWindow;  // The single inforWindow.

var _coopersTown;  // openweathermap.org id 5113664

var _initialMapBounds;

var _placesRequestPending = false;

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

        _initialMapBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(42.50969783834314, -75.29208158984375),
            new google.maps.LatLng(42.81769848711016, -74.61642241015625));
    },

    getMap: function() {
        return _map;
    },

    getInfoWindow: function() {
        return _infoWindow;
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
            var rtnData = [];
            return new Promise(function(resolve, reject) {
                if (search === '') {
                    resolve([]);
                }
                else {
                    maps.PlacesService._placesService.nearbySearch({
                        location: _coopersTown,
                        keyword: search,
                        rankBy: google.maps.places.RankBy.DISTANCE
                    }, function (results, status, pagination) {
                        if (status === google.maps.places.PlacesServiceStatus.OK &&
                            pagination.hasNextPage) {
                            rtnData = rtnData.concat(maps.PlacesService.placeResult(
                                results, status));
                        //    pagination.nextPage();
                        //}
                        //else if (status === google.maps.places.PlacesServiceStatus.OK &&
                        //    !pagination.hasNextPage) {
                        //    rtnData = rtnData.concat(maps.PlacesService.placeResult(results,
                        //        status));
                        //    console.log(rtnData);
                            resolve(rtnData);
                        }
                        else {
                            console.log('Google Places Service Returned an error ' + status);
                            resolve([]);
                        }


                    });
                }
            });
        },

        setCategory: function(place) {
            var food = [
                'restaurant',
                'bar',
                'cafe',
                'food',
                'grocery_or_supermarket',
                'bakery'
            ];
            var lodging = ['lodging'];
            var fun = [
                'amusement_park',
                'aquarium',
                'art_gallery',
                'bowling_alley',
                'casino',
                'movie_theater',
                'museum',
                'night_club',
                'park',
                'zoo'
            ];
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
         */
        placeResult: function(results, status) {

            var length = results.length;
            var rtnPlaces = [];

            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return rtnPlaces;
            }
            else {
                for (var i = length - 1; i >= 0; i--) {

                    if (_initialMapBounds.contains(results[i].geometry.location)) {
                        var temp = {};
                        temp.name = results[i].name;
                        temp.id = results[i].place_id;
                        temp.icon = results[i].icon;
                        temp.location = results[i].geometry.location;

                        // Set Category based on Google Places Types
                        temp.category = maps.PlacesService.setCategory(results[i]);
                        rtnPlaces.push(temp);
                    }
                }
            }

            return rtnPlaces;
        },

        detailResult: function(result) {

            //var infobox = document.createElement('div');
            //
            //var disclaimer = document.createElement('div');
            //disclaimer.setAttribute('id', 'disclaimer');
            //disclaimer.textContent = 'Data provided by Google';
            //
            //var name = document.createElement('h3');
            //name.textContent = result.name;
            //
            //var address = document.createElement('address');
            //address.textContent = result.formatted_address;
            //
            //infobox.appendChild(disclaimer);
            //infobox.appendChild(name);
            //infobox.appendChild(address);

            var html = '<div id="detail-info"><div id="disclaimer">Data provided by Google</div>';
            html = html + '<h3>' + result.name + '</h3>';
            html = html + '<address>' + result.formatted_address +'</address>';

            if (Object.prototype.toString.call(result.photos) === '[object Array]') {
                var i = result.photos.length;
                html = html + '<div class="places-images">';
                for (var x = 0; x < i; x++) {
                    var image = result.photos[x];
                    html = html + '<img class="place-image" src="' +
                        image.getUrl({'maxWidth': 100, 'maxHeight': 100 }) + '" />';
                }
                html = html + '</div>';
            }
            html = html + '</div>';
            return html;
        },

        detailInfo: function(placeId) {
            return new Promise(function(resolve, reject) {
                /**
                 * Get detail information from Google Maps Places API.
                 * @param {Integer} tries Number of attempts before failing.
                 */
                var getDetail = function(tries) {
                    if (tries === 0) {
                        reject(Error('Unable to Complete Google Places API Query'));
                    }

                    if (placeId === '') {
                        resolve([]);
                    }
                    else {
                        maps.PlacesService._placesService.getDetails({
                            placeId: placeId
                        }, function (result, status) {

                            if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT)
                            {
                                setTimeout(function() {
                                    getDetail(tries - 1);
                                }, 5000);

                            }
                            else if (status === google.maps.places.PlacesServiceStatus.OK) {
                                var rtnData;
                                rtnData = maps.PlacesService.detailResult(result, status);
                                // console.log(rtnData);
                                resolve(rtnData);
                            }
                            else {
                                reject(Error('No Places Returned: ' + status.toString()));
                            }
                        });
                    }

                };
                // Try request up to three times in the event we run into OVER_QUERY_LIMIT
                // error
                getDetail(3);
            });

        }
    },

    MarkerService: {
        markers: {},

        // iconUrl: 'http://maps.google.com/mapfiles/kml/paddle/',

        iconMapping: {
            'restaurant': 'https://maps.google.com/mapfiles/kml/paddle/red-circle.png',
            'lodging': 'https://maps.google.com/mapfiles/kml/paddle/blu-circle.png',
            'fun': 'https://maps.google.com/mapfiles/kml/paddle/ylw-circle.png',
            'baseball': 'images/baseball.png',
            'general': 'https://maps.google.com/mapfiles/kml/paddle/purple-circle.png'
        },

        // addMarker: function(name, location, locationtype, curated) {
        addMarker: function(place) {

            var catIcon = maps.MarkerService.iconMapping[place.category()];

            var image = {
                url: catIcon,
                scaledSize: new google.maps.Size(30, 30)
            };


            var marker = new google.maps.Marker({
                map: _map,
                opacity: 1.0,
                position: new google.maps.LatLng(place.location.lat(), place.location.lng()),
                title: place.name(),
                icon: image,
                animation: google.maps.Animation.DROP
            });

            // Make sure Marker is visible on the map, if set center and zoom to initial value
            if (!_map.getBounds().contains(marker.getPosition())) {
                maps.setDefaultZoomAndCenter();
            }

            return marker;
        },

        setVisible: function(name, visible) {
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

            // If marker exists and NOT curated, then delete
            if (maps.MarkerService.markerExist(name) && !maps.MarkerService.markers[name].stored) {
                maps.MarkerService.markers[name].marker.setMap(null);
                delete maps.MarkerService.markers[name];
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
                // _infoWindow.setContent({name: name});
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
