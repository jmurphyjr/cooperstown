/**
 * Created by jack on 11/22/15.
 */
/* jshint node: true */
'use strict';

var ko = require('knockout');
var GoogleMaps = require('./google');
var cooperstownFirebase = require('./firebaseInterface');

function Location(data) {
    try {
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
    catch (e) {
        console.log(e);
        console.log(data);
    }
}

function Place(data, type) {

    var store = (type === 'new') ? true : (type === 'saved');
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
        var response;
        try {
            response =   self.location.lat() + ',' + self.location.lng();
        }
        catch (e) {
            console.log(this);
        }
        return response;
    });

    GoogleMaps.MarkerService.addMarker(this.name(), this.location, this.category(), store);

    this.isSelected.subscribe(function(selected) {

        if (selected) {
            GoogleMaps.MarkerService.animateMarker(self.name());
        }
    });

    /**
     * @description Set Marker visibility
     */
    this.isVisible.subscribe(function(current) {
        GoogleMaps.MarkerService.setVisible(self.name(), current);
    });

    if (type === 'new') {

        self.getDistance().then(function(result) {
            self.distanceToDreamsPark('Distance to DP: ' + result);
            cooperstownFirebase.tryCreateNewPlace(this.name(), ko.toJS(this));
        });
    }
    else if (type === 'temp') {
        self.getDistance();
    }
}

/**
 * @description Gets distance to Cooperstown Dreams Park
 * @returns {Promise}
 */
Place.prototype.getDistance = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
        if (self.name() !== 'Cooperstown Dreams Park' && self.distanceToDreamsPark() === '') {
            GoogleMaps.DistanceService.distanceToCooperstownPark(self.location.getLocation())
                .then(function (result) {
                    if (result !== undefined) {
                        resolve(result);

                    }
                    else {
                        reject(false);
                    }
                });
        }
    });
};

module.exports = Place;
