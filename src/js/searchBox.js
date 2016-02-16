/**
 * Created by jack on 11/19/15.
 */

'use strict';

var ko = require('knockout');

var SearchBox = function SearchBox() {

    this.filter = ko.observable('').publishOn('filterPlaces').extend({ rateLimit: 500 });

};

SearchBox.prototype.loadBindings = function(bindto) {
    ko.applyBindings(this, bindto);
};


module.exports = new SearchBox();
