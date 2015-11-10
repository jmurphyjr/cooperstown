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
    },
    /**
     * @describe Adds marker to the map and saves it to the marker attribute
     * @param loc A Place item.
     */
    addMarker: function (loc) {
        var location = null;
        // console.log(googleLoaded());
        if (!googleLoaded()) {
            console.log('addMarker returned undefined');
            return undefined;
        }
        location = loc.location.getLocation();
        console.log(location);

        loc.marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(location.lat, location.long),
            title: loc.name(),
            label: loc.category().toUpperCase(),
            animation: google.maps.Animation.DROP
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
        m.setAnimation(google.maps.Animation.BOUNCE);
    }
};
