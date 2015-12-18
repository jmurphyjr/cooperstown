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

    this.filter = ko.observable('').subscribeTo('filterPlaces');

    this.place = ko.observable('').publishOn('addPlace');

    this.curatedCooperstown = ko.observableArray([]).subscribeTo('filteredList');

    this.googlePlaces = ko.observableArray([]);

    this.autoCompletePlaces = ko.computed(this._autoplaces, this);

    // this.googlePlaces.subscribe(function(updated) {
    //     ko.utils.arrayForEach(updated, function(item) {
    //         if (item.distanceToDreamsPark === undefined) {
    //             GoogleMaps.DistanceService.distanceToCooperstownPark(item.location)
    //                 .then(function(result) {
    //                     item.distanceToDreamsPark = ko.observable(result);
    //                 });
    //         }
    //     });
    // });

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


    GoogleMaps.PlacesService.autoCompleteService(searchFilter)

        .then(function(result) {
            var self = this;
            console.log(this);
            //console.log(result);
            if (result.length > 0) {
                self._getResults(result).forEach(function(p) {
                    ko.utils.arrayForEach(self.googlePlaces, function(x) {
                        if (x.name().toLowerCase().indexOf(searchFilter) === -1) {
                            x.isVisible(false);
                        }
                    });
                    self.googlePlaces.push(new Place(p, 'temp'));
                    // placesFound.push(new Place(p, 'temp'));
                    // self.googlePlaces.push(p);

                });


            }
            else {
                GoogleMaps.MarkerService.removeAllMarkers();
                self.googlePlaces([]);
                // placesFound = [];
                // console.log('empty result');
            }
        }.bind(this));
    // return placesFound;
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
