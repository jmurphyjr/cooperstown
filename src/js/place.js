/**
 * Created by jack on 11/22/15.
 */
/* jshint node: true */
/* global google */
/* global Promise */
'use strict';

var ko = require('knockout');
ko.mapping = require('knockout-mapping');
var GoogleMaps = require('./google');
var cooperstownFirebase = require('./firebaseInterface');
var $ = require('jquery');

function Location(data) {
    try {

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

    var self = this;
    this.id = ko.observable(data.id);
    this.name = ko.observable(data.name);
    this.isVisible = ko.observable(true);
    this.location = new Location(data.location);

    this.detailInfo = ko.observable('');

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

    var marker = GoogleMaps.MarkerService.addMarker(self);

    $( document ).ready(function() {
        var isMobileTest = window.matchMedia("only screen and (max-width: 760px)");

        if (isMobileTest.matches) {
            marker.addListener('mousedown', function () {
                self.isSelected(true);

            });
        }
        else {
            marker.addListener('click', function () {
                self.isSelected(true);

            });

        }
    });


    this.isSelected.subscribe(function(selected) {
        var map = GoogleMaps.getMap();
        console.log(selected);
        var infoWindow = GoogleMaps.getInfoWindow();

        if (selected) {
            infoWindow.close();

            self.isVisible(true);
            if (!map.getBounds().contains(marker.getPosition())) {
                GoogleMaps.setDefaultZoomAndCenter();
            }
            infoWindow.setContent(self.detailInfo());
            infoWindow.open(map, marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);

            (function() {
                var markerContext = marker;
                setTimeout(function() {
                    markerContext.setAnimation(null);
                }, 2000);
            })();
            ko.postbox.publish('selectedPlace', self);

        }
        else {
            marker.setAnimation(null);
        }


    });

    this.setDetailInfo();


    /**
     * @description Set Marker visibility
     */
    this.isVisible.subscribe(function(current) {
        marker.setVisible(current);
    });

    if (type === 'new') {

        self.getDistance().then(function(result) {
            self.distanceToDreamsPark('Distance to DreamsPark: ' + result);
            cooperstownFirebase.tryCreateNewPlace(this.name(), ko.toJS(this));
        });
    }
    else if (type === 'temp') {
        self.getDistance().then(function(result) {
            self.distanceToDreamsPark('Distance to DreamsPark: ' + result);
        });
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

Place.prototype.setDetailInfo = function() {
    var self = this;

    if (self.detailInfo() === '') {
        GoogleMaps.PlacesService.detailInfo(self.id())
            .then(function (result) {
                if (result !== undefined) {
                    self.detailInfo(result);
                }
                else {
                    self.detailInfo('No Data');
                }
            }, function (error) {
                console.log(error.toString());
            });
    }


};

Place.prototype.saveLocation = function() {
    var mapping = {
        'ignore': ['getDistance']
    };
    cooperstownFirebase.tryCreateNewPlace(this.name(), ko.mapping.toJS(this, mapping));
};

module.exports = Place;
