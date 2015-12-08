/**
 * Created by jack on 11/22/15.
 */
/* jshint node: true */
/* global google */
'use strict';

var ko = require('knockout');
var GoogleMaps = require('./google');
var cooperstownFirebase = require('./firebaseInterface');

function Location(data) {
    console.log(typeof data.lat);
    if (typeof data.lat === 'function') {
        this.lat = ko.observable(data.lat());
    }
    else {
        this.lat = ko.observable(data.lat);
    }

    if (typeof data.lng === 'function') {
        this.lng = ko.observable(data.lng());
    }
    else {
        this.lng = ko.observable(data.lng);
    }
}

function Place(data, type) {
    // ko.mapping.fromJS(data, {}, this);
    var self = this;
    this.id = ko.observable(data.id);
    this.name = ko.observable(data.name);
    this.isVisible = ko.observable(true);
    this.location = new Location(data.location);
    this.distanceToDreamsPark = ko.observable('');
    this.icon = ko.observable(data.icon);

    this.isSelected = ko.observable(false);
    this.getLocation = ko.computed(function() {
        return  self.location.lat() + ',' + self.location.lng();
    });

    var map = GoogleMaps.getMap();
    var image = {
        url: self.icon(),
        scaledSize: new google.maps.Size(20, 20)
    };
    var marker = new google.maps.Marker({
        map: map,
        opacity: 1.0,
        position: new google.maps.LatLng(self.location.lat(), self.location.lng()),
        title: self.name(),
        icon: image,
        // TODO: label does not animate with the marker dropping for now.
        // label: { text: loc.category().toUpperCase() },
        animation: google.maps.Animation.DROP
    });

    // var setMarkerVisibility = function(visible) {
    //     marker.setVisible(visible);
    // };

    this.isSelected.subscribe(function(selected) {

        marker.setAnimation(null);
        if (selected) {
            var map = GoogleMaps.getMap();
            var markerPosition = marker.getPosition();

            // If Marker not contained in current bounds, set center and zoom to default values
            if (!map.getBounds().contains(markerPosition)) {
                GoogleMaps.setDefaultZoomAndCenter();
            }
            marker.setAnimation(google.maps.Animation.BOUNCE);
            (function() {
                var markerContext = marker;
                setTimeout(function() {
                    markerContext.setAnimation(null);
                }, 2000);
            })();
        }
    });

    this.isVisible.subscribe(function(current) {
            marker.setVisible(current);
    });

    /**
     * IIFE to calculate the distance to Dreams Park for all curated locations, except DP itself
     */
    (function distanceToCp() {

        if (self.name() !== 'Cooperstown Dreams Park') {
            GoogleMaps.DistanceService.distanceToCooperstownPark(marker.getPosition())
                .then(function(result) {
                    if (result !== undefined) {
                        self.distanceToDreamsPark('Distance to DP: ' + result);
                    }
                });
        }
    })();

    if (type === 'new') {
        console.log(ko.toJS(this));
        cooperstownFirebase.tryCreateNewPlace(this.name(), ko.toJS(this));
    }
    // this.distanceToCp();
}

module.exports = Place;
