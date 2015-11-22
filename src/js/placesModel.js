/**
 * Created by jack on 11/16/15.
 */
/* jshint node: true */

'use strict';

var ko = require('knockout');
ko.postbox = require('knockout-postbox');
var $ = require('jquery');
var self;

var Places = function Places() {
    self = this;

    self.places = ko.observableArray([]);
    self.loaded = ko.observable(false);

    self.visiblePlaces = ko.computed(this._isVisible, this).publishOn;

    self.filter = ko.observable('').subscribeTo('filterPlaces');
    self.filteredPlaces = ko.computed(self._filtered, this).publishOn('filteredList');

};

Places.prototype.loadBindings = function(bindto) {
    ko.applyBindings(self, bindto);
};

Places.prototype.loadModel = function(data) {
    // console.log(data);
    data.visibility = ko.observable(data.visibility);
    data.isSelected = ko.observable(false);
    // data.marker = marker;
    self.places.push(data);

};

Places.prototype.focusLocation = function(data) {

    self._unSelectPlaces();

    data.isSelected(true);
};

Places.prototype._unSelectPlaces = function() {
    self.places().forEach(function(p) {
        p.isSelected(false);
    });
};

Places.prototype._isVisible = function () {
    return ko.utils.arrayFilter(this.places(), function (p) {
        return p.visibility();
    });
};

Places.prototype._filtered = function() {
    var searchFilter = this.filter().toLowerCase();
    var placesFound;

    if (!searchFilter) {
        placesFound = this.places();
    }
    else {
        placesFound = ko.utils.arrayFilter(this.places(),
        function(place) {
            return ko.utils.stringStartsWith(
                place.name.toLowerCase(),
                searchFilter);

        });
    }
    return placesFound;
};

module.exports = Places;
