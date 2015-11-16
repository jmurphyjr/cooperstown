/**
 * Created by jack on 11/13/15.
 */
/* jshint node: true */

'use strict';

var GooglePlacesResults = function(type) {
    if (!(this instanceof GooglePlacesResults)) {
        return new GooglePlacesResults(type);
    }
    this.type = type;

};

GooglePlacesResults.prototype.type = undefined;

GooglePlacesResults.prototype.setType = function(type) {
    if (type !== 'detail' || type !== 'nearby') {
        throw new Error('Expected type to be either detail or nearby');
    }
    this.type = type;
};

GooglePlacesResults.prototype.getResults = function(results) {
    var params = [];
    var rtnResults = [];
    var loc = {};

    if (this.type === 'detail') {
        params = [
            'formatted_address',
            'formatted_phone_number',
            'name',
            'place_id',
            'rating',
            'reviews',
            'user_ratings_total'
        ];
    }
    else if (this.type === 'nearby') {
        params = [
            'name',
            'place_id',
            'types'
        ];
    }
    else {
        console.log('type is unknown');
    }
    console.log(results.length);
    for (var i = 0; i < results.length; i++) {
        console.log(results[i].name);
        console.log(results[i].place_id);
        console.log(results[i].types);

    }
    return params;
};

module.exports = GooglePlacesResults;
