/**
 * Created by jack on 11/19/15.
 */
'use strict';
var Firebase = require('firebase');
var utils = require('./utils');

var FirebaseInterface = function() {

    if (!(this instanceof FirebaseInterface)) {
        return new FirebaseInterface();
    }

    this.defaultOptions = {
        'dbURL': 'https://cooperstown.firebaseio.com/places'
    };
};

FirebaseInterface.prototype.cTownRef = '';

FirebaseInterface.prototype.options = null;

FirebaseInterface.prototype.init = function(callback) {

    var options = '';

    if (arguments.length === 2) {
        console.log(arguments);
        options = arguments[1];
    }

    if (typeof options === 'object') {
        this.options = utils.extend(this.defaultOptions, options);
    }
    else {
        this.options = this.defaultOptions;
    }

    console.log('defaultOptions: ' + JSON.stringify(this.defaultOptions));
    console.log('options: ' + JSON.stringify(this.options));

    if (typeof callback !== 'function') {
        console.log('callback must be a function');
    }

    this.cTownRef = new Firebase(this.options.dbURL);

    this.cTownRef.on('child_added', callback);
    this.cTownRef.on('child_removed', callback);

};

module.exports = new FirebaseInterface();
