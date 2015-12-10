/**
 * Created by jack on 11/10/15.
 */
/* global google */
'use strict';

/**
 * Inspired by the project InfoBox Project:
 * ref: http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/src/infobox.js
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

/**
 *
 * @param {google.maps.Map} map  An instance of google.maps.Map
 * @param options
 * @constructor
 */
function CustomOverlay() {
    this.div = document.createElement('div');
    this.div.classList.add('styled-infobox');
    this.layer = null;
    this.marker = null;
    this.position = null;
}

module.exports = CustomOverlay;

CustomOverlay.prototype = new google.maps.OverlayView();

CustomOverlay.prototype._map = null;
CustomOverlay.prototype._content = null;

CustomOverlay.prototype.onAdd = function() {

    this.layer = this.getPanes().floatPane;

    this.layer.appendChild(this.div);
};

CustomOverlay.prototype.draw = function() {
    // var overlayProjection = this.getProjection();
    console.log(this.marker.getIcon());

    var markerIcon = this.marker.getIcon();
    var cBounds = this.div.getBoundingClientRect();
    var cHeight = cBounds.height + markerIcon.scaledSize.height + 10;
    var cWidth = cBounds.width / 2;

    this.position = this.getProjection().fromLatLngToDivPixel(this.marker.getPosition());
    // this.position = this.getProjection().fromLatLngToContainerPixel(this.marker.getPosition());
    console.log(this.position);
    this.div.style.top = this.position.y - cHeight + 'px';
    this.div.style.left = this.position.x - cWidth + 'px';
    console.log(this.div.style.top + ', ' + this.div.style.left);
};

CustomOverlay.prototype.onRemove = function() {
    this.div.remove();
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
