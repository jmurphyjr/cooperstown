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
    var rtnResults = {};

    rtnResults.formatted_address = results.formatted_address;
    rtnResults.formatted_phone_number = results.formatted_phone_number;
    rtnResults.icon = results.icon;
    rtnResults.name = results.name;
    rtnResults.place_id = results.place_id;
    rtnResults.rating = results.rating;
    rtnResults.reviews = results.reviews;
    rtnResults.user_ratings_total = results.user_ratings_total;
    rtnResults.website = results.website;


    return rtnResults;
};

module.exports = GooglePlacesResultsDetail;
