/**
 * Created by jack on 11/19/15.
 */
/* jshint node: true */
'use strict';
var Firebase = require('firebase');
var utils = require('./utils');

var FirebaseInterface = function() {

    if (!(this instanceof FirebaseInterface)) {
        return new FirebaseInterface();
    }

    this.defaultOptions = {
        'dbURL': 'https://cooperstown.firebaseio.com/',
        'placesLocation': 'https://cooperstown.firebaseio.com/places',
        'commentsLocation': 'https://cooperstown.firebaseio.com/comments'
    };
};

FirebaseInterface.prototype.cTownRef = '';

FirebaseInterface.prototype.options = null;

FirebaseInterface.prototype.init = function(initialLoad, update) {

    var options = '';

    // if (arguments.length === 2) {
    //     console.log(arguments);
    //     options = arguments[1];
    // }
    //
    if (typeof options === 'object') {
        this.options = utils.extend(this.defaultOptions, options);
    }
    else {
        this.options = this.defaultOptions;
    }

    // console.log('defaultOptions: ' + JSON.stringify(this.defaultOptions));
    // console.log('options: ' + JSON.stringify(this.options));
    //
    // if (typeof callback !== 'function') {
    //     console.log('callback must be a function');
    // }

    this.cTownRef = new Firebase(this.options.dbURL);
    this.placesRef = new Firebase(this.options.placesLocation);

    this.placesRef.once('value', initialLoad);
    // this.placesRef.on('child_added', update);
    this.placesRef.on('child_removed', update);
    // this.newPlaceRef = this.placesRef.push();

};

FirebaseInterface.prototype.tryCreateNewPlace = function(place, placeData) {
    var self = this;
    self.placesRef.child(place).transaction(function(currentPlaceData) {
        if (currentPlaceData === null) {
            return placeData;
        }
    }, function(error, committed) {
            self.placeCreated(place, committed);
    });
};

FirebaseInterface.prototype.placeCreated = function(placeId, success) {
    if (!success) {
        console.error('place ' + placeId + ' already exists!');
    }
    else {
        console.log('Successfully created ' + placeId);
    }
};

FirebaseInterface.prototype.updatePlace = function(child, data) {
    var self = this;
    this.placesRef.child(child).update(data, self.updated);
};

FirebaseInterface.prototype.updated = function(error) {
    if (error) {
        console.log('Synchronization failed');
    }
    else {
        console.log('Synchronization succeeded');
    }
};

module.exports = new FirebaseInterface();
