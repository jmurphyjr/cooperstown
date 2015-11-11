/**
 * Created by jack on 11/10/15.
 */

/**
 * Inspired by the project InfoBox Project:
 * ref: http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/src/infobox.js
 *
 * @description Module to allow for ease of creating custom overlays for Google Maps API.
 * The module will allow for creating any overlay and attaching it to any position on the map.
 * The styling of the overlay is left to the user, however the structure of the overlay content
 * will be as follows:
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
 *      relative: position as it relates to the target ['above', 'below', 'left', 'right']
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
function CustomOverlay(map, options) {
    options = options || {};

    this._map = map || {};

    // This module was developed with Version 3.22.12a of google maps api
    if (this._map.version !== '3.22.12a')
        throw Error('CustomOverlay depends on Google Maps API Version 3.22.12a');

    // Must explicitly call setMap on the overlay according to documentation.
    // Ref: https://developers.google.com/maps/documentation/javascript/3.exp/reference#OverlayView
    this.setMap(this._map);
}

module.exports = CustomOverlay;

CustomOverlay.prototype = new google.maps.OverlayView();

CustomOverlay.prototype._map = null;
CustomOverlay.prototype._content = null;

CustomOverlay.prototype.onAdd = function() {

};

CustomOverlay.prototype.draw = function() {

};

CustomOverlay.prototype.onRemove = function() {

};
