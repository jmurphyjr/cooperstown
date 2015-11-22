/**
 * Created by jack on 11/19/15.
 */

'use strict';

var ko = require('knockout');

var SearchBox = function SearchBox() {
    var self = this;

    self.filter = ko.observable('').publishOn('filterPlaces');

};

SearchBox.prototype.loadBindings = function(bindto) {
    var self = this;
    ko.applyBindings(this, bindto);
};


module.exports = SearchBox;
