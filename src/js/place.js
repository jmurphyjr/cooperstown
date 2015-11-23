/**
 * Created by jack on 11/22/15.
 */
/* jshint node: true */
/* global google */
'use strict';

var ko = require('knockout');

function Address(data) {
    this.street = ko.observable(data.street);
    this.city = ko.observable(data.city);
    this.state = ko.observable(data.state);
}

function Location(data) {
    this.lat = ko.observable(data.latitude);
    this.lng = ko.observable(data.longitude);
}

function Place(data, map) {
    // ko.mapping.fromJS(data, {}, this);
    var self = this;
    this.id = ko.observable(data.id);
    this.name = ko.observable(data.name);
    this.description = ko.observable(data.description);
    this.visibility = ko.observable(data.visibility);
    this.website = ko.observable(data.website);
    this.address = new Address(data.address);
    this.location = new Location(data.location);

    this.isSelected = ko.observable(false);
    this.getLocation = ko.computed(function() {
        return { lat: self.location.lat(), lng: self.location.lng() };
    });

    var marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(self.location.lat(), self.location.lng()),
        title: self.name(),
        // TODO: label does not animate with the marker dropping for now.
        // label: { text: loc.category().toUpperCase() },
        animation: google.maps.Animation.DROP
    });
}

module.exports = Place;
