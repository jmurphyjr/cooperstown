/**
 * Created by jack on 11/30/15.
 */
/* jshint node: true */

'use strict';

var ko = require('knockout');
var GoogleMaps = require('./google');

var PlacesAutoComplete = function() {

    this.filter = ko.observable('').subscribeTo('filterPlaces');

    this.place = ko.observable('').publishOn('addPlace');

    this.curatedCooperstown = ko.observableArray([]).subscribeTo('filteredList');

    this.googlePlaces = ko.observableArray();

    this.autoCompletePlaces = ko.computed(this._autoplaces, this);

};

PlacesAutoComplete.prototype.loadBindings = function(bindto) {
    ko.applyBindings(this, bindto);
};

PlacesAutoComplete.prototype.addLocation = function(data) {
    console.log(data);
    this.place(data, 'new');
    this.googlePlaces().remove(data);
};

PlacesAutoComplete.prototype._autoplaces = function() {
    var searchFilter = this.filter().trim().toLowerCase();

    var self = this;
    // self.googlePlaces.removeAll();
    // var placesFound = ko.observable();

    GoogleMaps.PlacesService.autoCompleteService(searchFilter)
        .then(GoogleMaps.PlacesService.placeResult)
        .then(function(result) {
            if (result.length > 0) {

                // 1. Remove Markers Not Included in result latest search update.

                // 2. Add Markers not already displayed on map.

                // 3. Update googlePlaces with new results.


                var newResultNames = result.map(function(obj) { return obj.name; } );
                var oldPlaceNames = ko.utils.arrayMap(self.googlePlaces(), function(obj) { return obj.name; });
                console.log(newResultNames);
                console.log(oldPlaceNames);
                // GoogleMaps.MarkerService.removeMarker(newResultNames);
                var diffNames = newResultNames.filter( function(el) { return oldPlaceNames.indexOf(el) < 0; });
                console.log(diffNames);

                // Filter out existing locations from the Google Places Results
                console.log(self.googlePlaces());
                console.log(result);
                console.log(self.googlePlaces());
                self._addMarkers(result);
                self.googlePlaces(self._getResults(result));
            }
            else {
                GoogleMaps.MarkerService.removeAllMarkers();
                self.googlePlaces([]);
                console.log('empty result');
            }
        });
};

PlacesAutoComplete.prototype.areDifferentBy = function(inPlace) {
    // var namesGooglePlaces = this.googlePlaces().map( function(x) { return x.name; }).unique();
    var namesInPlace = inPlace.map(function(x) { return x.name; }).unique();
    var names = namesInPlace.concat(namesGooglePlaces).unique();
    console.log(names);
};

PlacesAutoComplete.prototype._removeFilteredPlaces = function(inPlaces) {

    inPlaces.forEach(function(p) {



    });
    ko.utils.arrayForEach(this.googlePlaces(), function(p) {
        console.log(p.name);
        if (!(inPlaces.indexOf(p.name) > -1)) {
            console.log('removing ' + p.name + ' from Markers');
            GoogleMaps.MarkerService.removeMarker(p.name());

        }
    });
};

PlacesAutoComplete.prototype._addMarkers = function(result) {
    result.forEach(function(p) {
        GoogleMaps.MarkerService.addMarker(p.name, p.location, p.category, false);
    });
};

/**
 *
 * @param data
 * @returns {*}
 * @private
 */
PlacesAutoComplete.prototype._getResults = function(data) {
    var self = this;

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
