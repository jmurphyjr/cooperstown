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

    this.googlePlaces.subscribe(function(updated) {
        ko.utils.arrayForEach(updated, function(item) {
            if (item.distanceToDreamsPark === undefined) {
                GoogleMaps.DistanceService.distanceToCooperstownPark(item.location)
                    .then(function(result) {
                        item.distanceToDreamsPark = ko.observable(result);
                    });
            }
        });
    });

};

PlacesAutoComplete.prototype.loadBindings = function(bindto) {
    ko.applyBindings(this, bindto);
};

PlacesAutoComplete.prototype.addLocation = function(data) {
    console.log(data);
    this.place(data, 'new');
    GoogleMaps.MarkerService.removeMarker(data.name);
    this.googlePlaces.remove(data);
};

PlacesAutoComplete.prototype._autoplaces = function() {
    var searchFilter = this.filter().trim().toLowerCase();

    var self = this;
    // self.googlePlaces.removeAll();
    // var placesFound = ko.observable();

    GoogleMaps.PlacesService.autoCompleteService(searchFilter)
        // .then(GoogleMaps.PlacesService.placeResult)
        .then(function(result) {
            console.log(result);
            if (result.length > 0) {
                console.log(GoogleMaps.MarkerService.markers);
                // 1. Remove Markers Not Included in result latest search update.

                // 2. Add Markers not already displayed on map.

                // 3. Update googlePlaces with new results.


                var newResultNames = result.map(function(obj) { return obj.name; } );
                var oldPlaceNames = ko.utils.arrayMap(self.googlePlaces(), function(obj) {
                    return obj.name;
                });
                console.log(newResultNames);
                console.log(oldPlaceNames);
                // GoogleMaps.MarkerService.removeMarker(newResultNames);
                if (oldPlaceNames.length >= 1) {
                    var diffNames = newResultNames( function(el) {
                        return oldPlaceNames.indexOf(el) < 0;
                    });
                    console.log('Diff Names');
                    console.log(diffNames);
                }

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

PlacesAutoComplete.prototype._removeFilteredPlaces = function(inPlaces) {
    inPlaces.forEach(function(p) {
        if (GoogleMaps.MarkerService.markers.hasOwnProperty(p)) {
            GoogleMaps.MarkerService.removeMarker(p);
        }
    });
};

PlacesAutoComplete.prototype._addMarkers = function(result) {
    result.forEach(function(p) {
        if (!GoogleMaps.MarkerService.markers.hasOwnProperty(p.name)) {
            GoogleMaps.MarkerService.addMarker(p.name, p.location, p.category, false);
        }
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
