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
        // self.clearMarkers();

        data.forEach(function(p) {
            GoogleMaps.MarkerService.addMarker(p.name.trim(), p.location, p.category, false);
        });
    });
};

PlacesAutoComplete.prototype.loadBindings = function(bindto) {
    ko.applyBindings(this, bindto);
};

PlacesAutoComplete.prototype.addLocation = function(data) {
    console.log(data);
    data.marker = '';
    this.place(data, 'new');
};

PlacesAutoComplete.prototype._autoplaces = function() {
    var searchFilter = this.filter().trim().toLowerCase();

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
                GoogleMaps.MarkerService.removeAllMarkers();
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
    // console.log(self.curatedCooperstown());
    ko.utils.arrayForEach(self.curatedCooperstown(), function(p) {
        var i = data.length;

        while(i--) {
            if (data[i].name.trim() === p.name().trim()) {
                // console.log('deleting ' + data[i].name);
                data.splice(i, 1);
            }
        }
    });
    return data;
};

module.exports = PlacesAutoComplete;
