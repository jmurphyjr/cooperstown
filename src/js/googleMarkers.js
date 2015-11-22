/**
 * Created by jack on 11/19/15.
 */

'use strict';

var GoogleMarkers = function GoogleMarkers(map) {
    this.map = map;
};

GoogleMarkers.prototype.addMarker = function(place) {
    console.log(place);
    return new google.maps.Marker({
        map: this.map,
        position: new google.maps.LatLng(place.location.latitude,
            place.location.longitude),
        title: place.name,
        // TODO: label does not animate with the marker dropping for now.
        // label: { text: loc.category().toUpperCase() },
        animation: google.maps.Animation.DROP
    });

};

module.exports = GoogleMarkers;
