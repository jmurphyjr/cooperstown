/**
 * Created by jack on 11/5/15.
 */
/* jshint node: true */
'use strict';
var map;
console.log('entered google.js');

function googleLoaded() {
    return (typeof google === 'object');
}

module.exports = {

    // return {
    addMapToCanvas: function (mapCanvas) {
        console.log('executing addMapToCanvas()');
        var myOptions = {
            // center: new google.maps.LatLng(42.6972, -74.9269),
            center: new google.maps.LatLng(42.6638889, -74.954252),
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
    addMarker: function (loc) {

        console.log(googleLoaded());
        if (!googleLoaded()) {
            console.log('addMarker returned undefined');
            return undefined;
        }

        var marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(loc.lat, loc.long),
            animation: google.maps.Animation.DROP
        });

        return marker;
    },
    getMap: function () {
        return map;
    },
    clearMarkerAnimation: function(m) {
        if (!googleLoaded()) {
            return undefined;
        }
        m.setAnimation(null);
    },

    animateMarker: function(m) {
        m.setAnimation(google.maps.Animation.BOUNCE);
    }
    // }


};
