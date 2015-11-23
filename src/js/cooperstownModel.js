/**
 * Created by jack on 11/22/15.
 */

/* jshint node: true */

'use strict';
/**
 * Bring in requirements to support this module.
 */
var $ = require('jquery');
var ko = require('knockout');
ko.postbox = require('knockout-postbox');

var Place = require('./place');

var CooperstownViewModel = function() {
    if ( !(this instanceof CooperstownViewModel) ) {
        return new CooperstownViewModel();
    }

    this.places = ko.observableArray([]);

    this.visiblePlaces = ko.computed(this._isVisible, this);

    this.filter = ko.observable('').subscribeTo('filterPlaces');

    this.filteredPlaces = ko.computed(this._filtered, this).publishOn('filteredList');
};

CooperstownViewModel.prototype.init = function(map) {
    this.map = map;
};

CooperstownViewModel.prototype.map = '';

CooperstownViewModel.prototype.loadBindings = function(bindto) {
    ko.applyBindings(this, bindto);
};

CooperstownViewModel.prototype._isVisible = function () {
    return ko.utils.arrayFilter(this.places(), function (p) {
        return p.visibility();
    });
};

CooperstownViewModel.prototype.addPlace = function(place) {
    this.places().push(new Place(place, this.map));

    // On initial load, the places list will not show. Force an update
    // by notifying subscribers to the filter
    this.filter.notifySubscribers();
};

CooperstownViewModel.prototype.setMapAttribute = function(map) {
    this.map = map;
};

CooperstownViewModel.prototype._filtered = function() {
    var searchFilter = this.filter().toLowerCase();
    var placesFound;

    if (!searchFilter) {
        placesFound = this.places();
    }
    else {
        placesFound = ko.utils.arrayFilter(this.places(),
            function(place) {
                return ko.utils.stringStartsWith(
                    place.name().toLowerCase(),
                    searchFilter);

            });
    }
    return placesFound;
};

module.exports = new CooperstownViewModel();
