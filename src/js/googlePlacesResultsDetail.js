/**
 * Created by jack on 11/16/15.
 */
/* jshint node: true */

'use strict';

var GooglePlacesResults = require('./googlePlacesResults.js');

var GooglePlacesResultsDetail = function() {
    if (!(this instanceof GooglePlacesResultsDetail)) {
        return new GooglePlacesResultsDetail();
    }

};

GooglePlacesResultsDetail.prototype = Object.create(GooglePlacesResults.prototype);

GooglePlacesResultsDetail.prototype.constructor = GooglePlacesResultsDetail;

GooglePlacesResultsDetail.prototype.params = [
    'formatted_address',
    'formatted_phone_number',
    'icon',
    'name',
    'place_id',
    'rating',
    'reviews',
    'user_ratings_total'
];

GooglePlacesResultsDetail.prototype.getResults = function(results) {
    var rtnResults = [];

    for (var i = 0; i < results.length; i++) {
        var loc = {};
        loc.formatted_address = results[i].formatted_address;
        loc.formatted_phone_number = results[i].formatted_phone_number;
        loc.icon = results[i].icon;
        loc.name = results[i].name;
        loc.place_id = results[i].place_id;
        loc.rating = results[i].rating;
        loc.reviews = results[i].reviews;
        loc.user_ratings_total = results[i].user_ratings_total;

        rtnResults.push(loc);
    }

    return rtnResults;
};

module.exports = GooglePlacesResultsDetail;
