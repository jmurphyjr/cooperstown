/**
 * Created by jack on 11/12/15.
 */
/* jshint node: true */
/* jshint expr: true */

'use strict';

var expect = require('chai').expect;
// var sinon = require('sinon');
// var $ = require('jquery');

var google = require('./fixtures/google-maps-stub.js');
window.google = google;

var GoogleMaps = require('../src/js/google.js');

describe('GoogleMaps', function() {

    var gMaps;
    before(function() {
        // gMaps = new GoogleMaps('map', { zoom: 5 });
        gMaps = new GoogleMaps('map', { zoom: 11,
            center: { lat: 42.6638889, lng: -74.954252 } });
    });


    describe('constructor', function() {
//         var gMaps;
//         before(function() {
//             // gMaps = new GoogleMaps('map', { zoom: 5 });
//             gMaps = new GoogleMaps('map', { zoom: 11,
//                 center: { lat: 42.6638889, lng: -74.954252 } });
//         });


        it('should have an initMap function', function() {
            expect(gMaps).itself.to.respondTo('initMap');
        });

        it('should have a getMap function', function() {
            expect(gMaps).itself.to.respondTo('getMap');
        });

        it('should have map attribute set to undefined', function() {
            expect(gMaps.map).to.be.undefined;
        });

        it('should have a distanceService attribute set to undefined', function() {
            expect(gMaps.distanceService).to.be.undefined;
        });

        it('should have a placesService attribute set to undefined', function() {
            expect(gMaps.placesService).to.be.undefined;
        });

    });

    describe('initMap', function() {


        it('should have map attribute set to object', function() {
            gMaps.initMap();
            expect(gMaps.map).to.be.an('object');
        });
     });

    describe('getMap', function() {

        it('should return a map object', function() {
            gMaps.initMap();
            var map = gMaps.getMap();
            console.log('zoom value is');
            console.log(map);
            expect(map).to.have.any.keys('zoom');
            // expect(map).to.have.property('zoom');
        });
    });
});
