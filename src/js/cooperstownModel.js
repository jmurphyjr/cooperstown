/**
 * Created by jack on 11/22/15.
 */

/* jshint node: true */

'use strict';
/**
 * Bring in requirements to support this module.
 */
var ko = require('knockout');
ko.postbox = require('knockout-postbox');
ko.options.deferUpdates = true;
var Place = require('./place');

var CooperstownViewModel = function() {
    if ( !(this instanceof CooperstownViewModel) ) {
        return new CooperstownViewModel();
    }

    this.places = ko.observableArray([]);

    this.visiblePlaces = ko.computed(this._isVisible, this);

    this.filter = ko.observable('').subscribeTo('filterPlaces');

    this.filteredPlaces = ko.computed(this._filtered, this).publishOn('filteredList');

    this.filteredPlaces.subscribe(this._filterSubscribe, this);
};

CooperstownViewModel.prototype.loadBindings = function(bindto) {
    ko.applyBindings(this, bindto);
};

CooperstownViewModel.prototype._isVisible = function () {
    return ko.utils.arrayFilter(this.places(), function (p) {
        return p.isVisible();
    });
};

CooperstownViewModel.prototype.addPlace = function(place) {
    this.places().push(new Place(place));

    // On initial load, the places list will not show. Force an update
    // by notifying subscribers to the filter
    this.filter.notifySubscribers();
};

CooperstownViewModel.prototype._filtered = function() {
    var searchFilter = this.filter().toLowerCase();
    var placesFound;

    if (!searchFilter) {
        placesFound = this.places();
        ko.utils.arrayForEach(this.places(), this._makeVisible);
    }
    else {
        placesFound = ko.utils.arrayFilter(this.places(),
            function(place) {
                if (!ko.utils.stringStartsWith(place.name().toLowerCase(), searchFilter)) {
                    place.isVisible(false);
                }
                else {
                    place.isVisible(true);
                }
                return ko.utils.stringStartsWith(
                    place.name().toLowerCase(),
                    searchFilter);

            });
    }
    return placesFound;
};

CooperstownViewModel.prototype.focusLocation = function(data) {

    // First set isSelected to false for all places
    this.places().forEach(function (p) {
        p.isSelected(false);
    });
    // Set this elements isSelected to true;
    data.isSelected(true);
};

CooperstownViewModel.prototype._filterSubscribe = function(newValue) {
    this.places().forEach(function(p) {
        if (p in newValue) {
            console.log(p);
        }
    });
};

CooperstownViewModel.prototype._makeVisible = function(p) {
    p.isVisible(true);
};

module.exports = new CooperstownViewModel();
