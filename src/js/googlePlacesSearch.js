/**
 * Created by jack on 11/12/15.
 */
/* jshint node: true */
/* global google */

'use strict';

var $ = require('jquery');
var GooglePlacesResultsNearby = require('./googlePlacesResultsNearby.js');
var GooglePlacesResultsDetail = require('./googlePlacesResultsDetail.js');

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

            setTimeout(function() {
                dfd.resolve(results);
            }, 500);
        }
        else {
            // Return null to indicate an error
            // console.log(status);
            // console.log(searchType + ': ' + JSON.stringify(options));
            dfd.reject(status);
        }
    });

    return dfd;
};

/**
 * In order to make a detailed GMP Detail Request, a placeId
 * is required.
 *
 * @param query
 */
GooglePlacesSearch.prototype.detailSearch = function(query) {

    var dfd = $.Deferred();

    var request = { placeId: query };
    var detailResults = new GooglePlacesResultsDetail();

    this._fetch('getDetails', request)
        .then(
            // On Success
            function(resp) {
                // console.log(resp);
                var results = detailResults.getResults(resp);
                // dfd.resolve(gResults.getResults(resp));
                dfd.resolve(results);
            },
            // On Error
            function(err) {
                dfd.reject('Uh oh! on error occurred! ', err);
            }
        );

    return dfd;
};

GooglePlacesSearch.prototype.nearby = function(query) {
    var dfd = $.Deferred();

    var gResults = new GooglePlacesResultsNearby();
    var request = {
        location: this.map.getCenter(),
        radius: 32000,
        // query: 'Cooperstown Bat Company',
        name: query
    };
    this._fetch('nearbySearch', request)
        .then(
            // On Success
            function(resp) {
                // console.log(resp);
                var results = gResults.getResults(resp);
                // dfd.resolve( gResults.getResults(resp));
                dfd.resolve(results);
            },
            // On Error
            function(err) {
                if (err === 'ZERO_RESULTS') {
                    dfd.resolve(undefined);
                }
                else {
                    dfd.reject('Uh oh! an error occurred! ' + err);
                }
            }
        );

    return dfd;
};

module.exports = GooglePlacesSearch;
