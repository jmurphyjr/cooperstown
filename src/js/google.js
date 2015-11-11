/**
 * Created by jack on 11/5/15.
 */
/* jshint node: true */
'use strict';
var map;
console.log('entered google.js');

/**
 * @description Checks if google attribute is defined as an object
 * @returns {boolean}
 */
function googleLoaded() {
    return (typeof google === 'object');
}

/**
 * @description The default center of the map.
 * @type {{location: {latitude: number, longitude: number}}}
 */
var mapCenter = {
    location: {
        latitude: 42.6638889,
        longitude: -74.954252
    }
};

/**
 * Holds the google.maps.DistanceMatrixService instance.
 */
var distanceService;
var placesService;

module.exports = {

    // return {
    addMapToCanvas: function (mapCanvas) {
        console.log('executing addMapToCanvas()');
        var myOptions = {
            // center: new google.maps.LatLng(42.6972, -74.9269),
            center: new google.maps.LatLng(mapCenter.location.latitude, mapCenter.location.longitude),
            zoom: 11,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
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
        map = new google.maps.Map(mapCanvas, myOptions);
        console.log(typeof map);
        distanceService = new google.maps.DistanceMatrixService();
        placesService = new google.maps.places.PlacesService(map);
    },
    /**
     * @describe Adds marker to the map and saves it to the marker attribute
     * @param loc A Place item.
     */
    addMarker: function (loc) {
        var location = null;
        var inwin = new google.maps.InfoWindow();

        // console.log(googleLoaded());
        if (!googleLoaded()) {
            console.log('addMarker returned undefined');
            return undefined;
        }
        location = loc.location.getLocation();

        loc.marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(location.lat, location.long),
            title: loc.name(),
            // TODO: label does not animate with the marker dropping for now.
            // label: { text: loc.category().toUpperCase() },
            animation: google.maps.Animation.DROP
        });

        google.maps.event.addListener(loc.marker, 'click', function() {
            inwin.setContent(loc.content);
            inwin.open(map, this);
        });
    },
    getMap: function () {
        return map;
    },

    /**
     * @describe Sets Marker Animation to null
     * @param m A Marker attribute.
     */
    clearMarkerAnimation: function (m) {
        if (!googleLoaded()) {
            return undefined;
        }
        m.setAnimation(null);
    },

    animateMarker: function (m) {
        if (!map.getBounds().contains(m.marker.getPosition())) {
            map.setCenter(m.marker.getPosition());
        }
        m.marker.setAnimation(google.maps.Animation.BOUNCE);
    },
    /**
     *
     * @param dp The Dreams Park Marker
     * @param other The marker we want the distance to.
     */
    distanceToDreamsPark: function(dp, other, callback) {
        // console.log(dp);
        // console.log(other);
        distanceService.getDistanceMatrix({
            origins: [dp.marker.getPosition()],
            destinations: [other.marker.getPosition()],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL
        }, function(response, status) {
            if (status !== google.maps.DistanceMatrixStatus.OK) {
                // throw Error('Did not receive OK from Google Distance Matrix Service');
                callback(undefined);
            }
            else {
                callback(response);
            }
        });
    },

    queryPlaces: function(place, callback) {
        var loc = new google.maps.LatLng(mapCenter.location.latitude, mapCenter.location.longitude);

        var request = {
            location: loc,
            radius: 32000,
            // textSearch field
            query: place,
            // radarSearch field
            name: place
        };
        placesService.nearbySearch(request, function(results, status) {
            if (status ===google.maps.places.PlacesServiceStatus.OK) {
                console.log('Results from textSearch for ' + request.name);
                console.log(results);

                var detailReq = { placeId: results[0].place_id };
                placesService.getDetails(detailReq, function(place, status) {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        console.log('Results from getDetails');
                        console.log(place);
                    }
                });
            }
            else {
                if (status === 'ZERO_RESULTS') {
                    console.log('No results found for ' + request.name);
                }
                else {
                    console.log(request.name + ': ' + status);
                }
            }
        });
    }

};
