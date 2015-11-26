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

var GoogleMaps = require('./google');

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


CooperstownViewModel.prototype.map = '';

CooperstownViewModel.prototype.loadBindings = function(bindto) {
    ko.applyBindings(this, bindto);
};

CooperstownViewModel.prototype._isVisible = function () {
    return ko.utils.arrayFilter(this.places(), function (p) {
        return p.isVisible();
    });
};

CooperstownViewModel.prototype.addPlace = function(place) {
    // Set the map attribute if not already set.
    if (this.map === '') {
        this.map = GoogleMaps.getMap();
    }

    this.places().push(new Place(place, this.map));

    console.log(this.places());
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
    var self = this;

    // First set isSelected to false for all places
    this.places().forEach(function (p) {
        p.isSelected(false);
    });
    // Set this elements isSelected to true;
    data.isSelected(true);
    data.setMarkerAnimation(google.maps.Animation.BOUNCE);
};

CooperstownViewModel.prototype._filterSubscribe = function(newValue) {
    console.log('filterPlaces subscription');
    // console.log(newValue);
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
