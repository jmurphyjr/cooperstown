/**
 * Created by jack on 11/12/15.
 */
/* jshint node: true */
/* global google */

'use strict';

var $ = require('jquery');
var GooglePlacesResultsNearby = require('./googlePlacesResultsNearby.js');

var GooglePlacesSearch = function(map, opts) {
    console.log('Constructed GooglePlacesSearch Instance');
    if ( !(this instanceof GooglePlacesSearch) ) {
        return new GooglePlacesSearch(map, opts);
    }

    this.map = map;
    this.placesService = new google.maps.places.PlacesService(this.map);
};

GooglePlacesSearch.prototype.placesService = undefined;

/**
 * @description
 * @param searchType
 * @param options
 * @returns {*} Returns a promise
 * @private
 */
GooglePlacesSearch.prototype._fetch = function(searchType, options) {

    var dfd = $.Deferred();

    if (!searchType) {
        dfd.resolve( [] );
        return dfd.promise();
    }

    this.placesService[searchType](options, function(results, status) {

        if (status === google.maps.places.PlacesServiceStatus.OK) {

            dfd.resolve(results);
        }
        else {
            // Return null to indicate an error
            dfd.reject(status);
        }
    });

    return dfd.promise();
};

/**
 * In order to make a detailed GMP Detail Request, a placeId
 * is required.
 *
 * @param query
 */
GooglePlacesSearch.prototype.detail = function(query) {

    var request = { placeId: query };

    this._fetch('getDetails', request)
        .then(function(resp) {
            console.log(resp);
        },
        function(err) {
            console.error('Uh oh! on error occurred! ', err);
        });

};

GooglePlacesSearch.prototype.nearby = function(query) {

    var gResults = new GooglePlacesResultsNearby();
    var request = {
        location: this.map.getCenter(),
        radius: 32000,
        // query: 'Cooperstown Bat Company',
        name: query
    };
    this._fetch('nearbySearch', request)
        .then(function(resp) {
            return gResults.getResults(resp);
        },
        function(err) {
            console.error('Uh oh! an error occurred! ', err);
        });
};

module.exports = GooglePlacesSearch;
