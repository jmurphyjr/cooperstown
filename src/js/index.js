/* jshint node: true */
'use strict';

var ko = require('knockout');
var gMaps = require('./google.js');

var PlacesViewModel = require('./places.js');

console.log(gMaps);

var el = document.getElementById('map');

gMaps.addMapToCanvas(el);

ko.applyBindings(new PlacesViewModel());

