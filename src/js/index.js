/* jshint node: true */
'use strict';

/**
 * The entry point for the cooperstown app.
 *
 */

var utils = require('./utils');
var main = require('./main.js');

utils.loadScript('google', main);
// window.onload = function() {
//     console.log('page is fully loaded');
//     main();
//
// };

// main();

// var viewModel = {
//     name: ko.observable('Joe'),
//     age: ko.observable(29),
//     location: {
//         lat: ko.observable(29.555),
//         lng: ko.observable(-74.555)
//     },
//     address: {
//         street: ko.observable('10403 Sweetbriar Parkway'),
//         city: ko.observable('Silver Spring'),
//         state: ko.observable('MD')
//     },
//     selected: ko.observable(true),
//     isSelected: ko.computed(function() {
//         return false;
//     })
//
// };
//
// function removeProperties(article, props) {
//     var len = props.length;
//     var obj = {};
//     for (var i = 0; i < len; i++) {
//         console.log(props[i]);
//         if (article.hasOwnProperty(props[i])) {
//             console.log('will delete ' + props[i]);
//             delete article[props[i]];
//         }
//     }
//     return article;
// }
// console.log(viewModel);
// var myTest = ko.toJS(viewModel);
// // delete myTest.selected;
// // delete myTest.isSelected;
// removeProperties(myTest, ['selected', 'isSelected']);
// console.log(myTest);
//
