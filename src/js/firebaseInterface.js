/**
 * Created by jack on 11/19/15.
 */
'use strict';
var Firebase = require('firebase');
var $ = require('jquery');

var FirebaseInterface = {
    'config': {
        'db': new Firebase('https://cooperstown.firebaseio.com/places')
    },
    'init': function(initCallback, callback) {
        FirebaseInterface.config.db.once('value', initCallback);
        FirebaseInterface.config.db.on('child_added', callback);
        FirebaseInterface.config.db.on('child_removed', callback);
    }
};

module.exports = FirebaseInterface;
