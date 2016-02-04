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
    this.isFiltered = ko.observable(false);
    this.filter.subscribe(function(update) {
        if (update.length > 0) {
            self.isFiltered(true);
        }
        else {
            self.isFiltered(false);
        }
    });

    this.currentPlace = ko.observable().publishOn('currentPlace');
    this.place = ko.observable('').publishOn('addPlace');

    this.curatedCooperstown = ko.observableArray([]).subscribeTo('filteredList');

    this.googlePlaces = ko.observableArray([]);

    this.autoCompletePlaces = ko.computed(this._autoplaces, this);

    this.onClick = function() {
        console.log('execute on click');
    };
};

PlacesAutoComplete.prototype.loadBindings = function(bindto) {
    ko.applyBindings(this, bindto);
};

PlacesAutoComplete.prototype.addLocation = function(data) {
    console.log(data);
    this.place(data, 'new');
    GoogleMaps.MarkerService.removeMarker(data.name());
    this.googlePlaces.remove(data);
};

PlacesAutoComplete.prototype._alreadyExists = function(place) {
    var found = false;
    ko.utils.arrayForEach(this.googlePlaces(), function(x) {
        if (x.name() === place.name) {
            found = true;
        }
    });
    return found;
};

PlacesAutoComplete.prototype._removePlace = function(place) {
    console.log(place);
    ko.utils.arrayForEach(this.googlePlaces(), function(x) {
        if (x.name() === place.name) {
            x.isVisible(false);
            this.googlePlaces.remove(x);
        }
    }.bind(this));
};

PlacesAutoComplete.prototype.focusLocation = function(data) {

    // First set isSelected to false for all places
    this.googlePlaces().forEach(function (p) {
        p.isSelected(false);
    });
    this.currentPlace(data);
    // Set this elements isSelected to true;
    data.isSelected(true);
    // GoogleMaps.PlacesService.detailInfo(data.id());

    return true;
};


PlacesAutoComplete.prototype._cleanPlaces = function(searchedPlaces) {

    var i = this.googlePlaces().length;

    while(i--) {
        var found = false;
        var currentPlace = this.googlePlaces()[i];
        searchedPlaces.forEach(function(place) {
            if (place.name === currentPlace.name()) {
                found = true;
            }
        });

        if (!found) {
            currentPlace.isVisible(false);
            this.googlePlaces.remove(currentPlace);
        }
    }
};

PlacesAutoComplete.prototype._autoplaces = function() {
    var searchFilter = this.filter().trim().toLowerCase();


    // Query Google Nearby Search for searchFilter
    GoogleMaps.PlacesService.autoCompleteService(searchFilter)
        .then(function(result) {
            console.log('Search Filter = ' + searchFilter);
            var self = this;

            // Filtering using the searchBox
            if (self.isFiltered()) {
                var searchedPlaces = self._getResults(result);
                if (self.googlePlaces().length > 0) {
                    // Removes existing googlePlaces that are not in the current searchFilter
                    self._cleanPlaces(searchedPlaces);
                }

                searchedPlaces.forEach(function(place) {
                        if (!self._alreadyExists(place)) {
                            self.googlePlaces.push(new Place(place, 'temp'));
                        }
                    // }
                });
            }
            else {
                ko.utils.arrayForEach(self.googlePlaces(), function(place) {
                    place.isVisible(false);
                });
                self.googlePlaces([]);
            }
        }.bind(this));
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
