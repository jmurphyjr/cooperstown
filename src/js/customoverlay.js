/**
 * Created by jack on 11/10/15.
 */
/* jshint node: true */
/* global google */
'use strict';

/**
 * Inspired by:
 * @ref http://artandlogic.com/2014/02/custom-google-maps-info-windows/
 *
 * @description Module to allow for ease of creating custom overlays for Google
 * Maps API. The module will allow for creating any overlay and attaching it to
 * any position on the map. The styling of the overlay is left to the user,
 * however the structure of the overlay content will be as follows:
 *
 * <div id="co-container">
 *     <div class="co-opt-['data']['key']">['data']['key'].value</div>
 *     ... for every element in the array
 * </div>
 *
 * Styling the CustomOverlay can be achieved by the users project css file.
 *
 * @param options
 *
 * options -
 *      target: What the overlay will be bound to
 *      relative: position as it relates to the target
 *                  ['above', 'below', 'left', 'right']
 *      offset: distance in pixels overlay will be offset from target.
 *      data: an object of the information to be displayed on the overlay
 *         ex. data: {
 *                      title: 'My Title',
 *                      description: 'Blah, blah, blah',
 *                      address1: '123 Anywhere St.',
 *                      address2: 'Anywhere, CT #####',
 *                      url: 'https://www.abc.com'
 *                   }
 *
 */

var ko = require('knockout');
var gMaps = require('./google');

/**
 *
 * @param {google.maps.Map} map  An instance of google.maps.Map
 * @param options
 * @constructor
 */
function CustomOverlay() {
    var self = this;
    this.container = document.createElement('div');
    this.container.classList.add('infobox-container');
    this.div = document.createElement('div');
    this.div.classList.add('styled-infobox');
    // this.div.innerHTML = '<span data-bind="text: name"></span>';

    this.layer = null;
    this.element = ko.observable().subscribeTo('currentPlace');
    this.position = null;

    var closeX = document.createElement('div');
    closeX.classList.add('styled-infobox-close');
    closeX.innerHTML = 'X';

    this.container.appendChild(this.div);
    this.container.appendChild(closeX);

    this.marker = null;

    this.map = gMaps.getMap();

}

module.exports = CustomOverlay;

CustomOverlay.prototype = new google.maps.OverlayView();

CustomOverlay.prototype._map = null;
CustomOverlay.prototype._content = null;

CustomOverlay.prototype.onAdd = function() {


    this.layer = this.getPanes().floatPane;

    this.container.getElementsByClassName('styled-infobox-close')[0].addEventListener('click',
        function() {
        // Close info window on click
        this.close();
    }.bind(this), false);

    this.layer.appendChild(this.container);
};

CustomOverlay.prototype.draw = function() {
    // var overlayProjection = this.getProjection();

    var mapCenter = this.map.getCenter();

    var mapheight = document.getElementById('map').clientHeight - 60;

    var markerIcon = this.marker.getIcon();

    // Get container boundary
    var cBounds = this.container.getBoundingClientRect();

    var cHeight = cBounds.height + markerIcon.scaledSize.height;
    var cWidth = cBounds.width / 2;

    // get position of marker in pixels
    this.position = this.getProjection().fromLatLngToDivPixel(this.marker.getPosition());

    this.container.style.top = this.position.y - cHeight + 'px';
    this.container.style.left = this.position.x - cWidth + 'px';

    cBounds = this.container.getBoundingClientRect();

    cHeight = cBounds.height;

    if (this.position.y + cHeight > mapheight) {
        this.position.y = this.position.y - (this.position.y + cHeight - mapheight);
        var point = this.getProjection().fromDivPixelToLatLng(this.position);
        this.map.setCenter(point);
    }
};

CustomOverlay.prototype.onRemove = function() {
    this.container.remove();
};

CustomOverlay.prototype.open = function(map, marker) {
    this.marker = marker;

    this.setMap(map);
};

CustomOverlay.prototype.close = function() {
    this.setMap(null);
};

CustomOverlay.prototype.setContent = function(html) {
    this.div.innerHTML = html;
};
