/**
 * Created by jack on 11/22/15.
 */
/* jshint node: true */
'use strict';

var ko = require('knockout');
var GoogleMaps = require('./google');
var cooperstownFirebase = require('./firebaseInterface');

function Location(data) {
    // console.log(typeof data.lat);

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

    var self = this;
    this.id = ko.observable(data.id);
    this.name = ko.observable(data.name);
    this.isVisible = ko.observable(true);
    this.location = new Location(data.location);
    if (data.distanceToDreamsPark !== undefined) {
        this.distanceToDreamsPark = ko.observable(data.distanceToDreamsPark);
    }
    else {
        this.distanceToDreamsPark = ko.observable('');
    }

    this.category = ko.observable(data.category);

    this.isSelected = ko.observable(false);
    this.location.getLocation = ko.computed(function() {
        return  self.location.lat() + ',' + self.location.lng();
    });

    GoogleMaps.MarkerService.addMarker(this.name(), this.location, this.category(), true);

    this.isSelected.subscribe(function(selected) {

        if (selected) {
            console.log(selected);
            GoogleMaps.MarkerService.animateMarker(self.name());
        }
    });

    this.isVisible.subscribe(function(current) {
        console.log(current);
        GoogleMaps.MarkerService.setVisible(self.name(), current);
    });

    /**
     * IIFE to calculate the distance to Dreams Park for all curated locations, except DP itself
     */
    if (this.distanceToDreamsPark() === '') {
        (function distanceToCp() {

            if (self.name() !== 'Cooperstown Dreams Park') {
                GoogleMaps.DistanceService.distanceToCooperstownPark(self.location.getLocation())
                    .then(function (result) {
                        if (result !== undefined) {
                            self.distanceToDreamsPark('Distance to DP: ' + result);
                            cooperstownFirebase.updatePlace(self.name(), ko.toJS(self));
                        }
                    });
            }
        })();
    }

    if (type === 'new') {
        console.log(ko.toJS(this));
        cooperstownFirebase.tryCreateNewPlace(this.name(), ko.toJS(this));
    }
}

module.exports = Place;
