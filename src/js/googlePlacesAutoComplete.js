/**
 * Created by jack on 11/30/15.
 */
/* jshint node: true */

'use strict';

var ko = require('knockout');
var GoogleMaps = require('./google');
var Place = require('./place');

var PlacesAutoComplete = function() {

    var self = this;
    var marker = '';
    this.filter = ko.observable('').subscribeTo('filterPlaces');

    this.place = ko.observable('').publishOn('addPlace');

    this.curatedCooperstown = ko.observableArray([]).subscribeTo('filteredList');

    this.googlePlaces = ko.observableArray();

    this.autoCompletePlaces = ko.computed(this._autoplaces, this);

    this.markers = [];

    this.googlePlaces.subscribe(function(data) {
        console.log(data);
        self.clearMarkers();

        data.forEach(function(p) {
            var image = {
                url: p.icon,
                scaledSize: new google.maps.Size(20, 20)
            };
            p.marker = new google.maps.Marker({
                map: GoogleMaps.getMap(),
                opacity: 1.0,
                position: new google.maps.LatLng(p.location.lat(), p.location.lng()),
                title: p.name,
                icon: image,
                // TODO: label does not animate with the marker dropping for now.
                // label: { text: loc.category().toUpperCase() },
                animation: google.maps.Animation.DROP
            });
            self.markers.push(p);

        });
    });
};

PlacesAutoComplete.prototype.loadBindings = function(bindto) {
    ko.applyBindings(this, bindto);
};

PlacesAutoComplete.prototype.clearMarkers = function() {
    this.markers.forEach(function(m) {
        if (m.marker.setVisible) {
            m.marker.setVisible(false);
        }
    });
    this.markers = [];
};

PlacesAutoComplete.prototype.addLocation = function(data) {
    console.log(data);
    data.marker = '';
    this.place(data, 'new');
};

PlacesAutoComplete.prototype._autoplaces = function() {
    var searchFilter = this.filter().toLowerCase();

    var self = this;
    self.googlePlaces.removeAll();
    // var placesFound = ko.observable();

    GoogleMaps.PlacesService.autoCompleteService(searchFilter)
        .then(GoogleMaps.PlacesService.placeResult)
        .then(function(result) {
            if (result.length > 0) {
                // Filter out existing locations from the Google Places Results
                self.googlePlaces(self._getResults(result));
            }
            else {
                console.log('empty result');
            }});

    // var test = GoogleMaps.AutoCompleteService.query(searchFilter);
};

/**
 *
 * @param data
 * @returns {*}
 * @private
 */
PlacesAutoComplete.prototype._getResults = function(data) {
    var self = this;
    // var test = data;
    console.log(self.curatedCooperstown());
    ko.utils.arrayForEach(self.curatedCooperstown(), function(p) {
        var i = data.length;

        while(i--) {
            if (data[i].name === p.name()) {
                // console.log('deleting ' + data[i].name);
                data.splice(i, 1);
            }
        }
    });
    return data;
};

module.exports = PlacesAutoComplete;
