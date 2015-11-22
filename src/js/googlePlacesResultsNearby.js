/**
 * Created by jack on 11/16/15.
 */
/* jshint node: true */

'use strict';

var GooglePlacesResults = require('./googlePlacesResults.js');

var GooglePlacesResultsNearby = function() {
    if (!(this instanceof GooglePlacesResultsNearby)) {
        return new GooglePlacesResultsNearby();
    }

};

GooglePlacesResultsNearby.prototype = Object.create(GooglePlacesResults.prototype);

GooglePlacesResultsNearby.prototype.constructor = GooglePlacesResultsNearby;

GooglePlacesResultsNearby.prototype.nearByComponents = {
    icon: 'icon',
    name: 'name',
    place_id: 'place_id',
    types: 'types'
};

GooglePlacesResultsNearby.prototype.getResults = function(results) {
    var rtnResults = [];

    for (var i = 0; i < results.length; i++) {
        var loc = {};
        loc.icon = results[i].icon;
        loc.name = results[i].name;
        loc.place_id = results[i].place_id;
        loc.types = results[i].types;

        rtnResults.push(loc);
    }

    return rtnResults;
};

module.exports = GooglePlacesResultsNearby;
