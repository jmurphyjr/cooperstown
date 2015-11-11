/**
 * Created by jack on 11/5/15.
 */
/* jshint node: true */
'use strict';

var ko = require('knockout');
ko.mapping = require('knockout-mapping');
var $ = require('jquery');
var gMaps = require('./google.js');
var utils = require('./utils.js');

/**
 * The information in the places object will be replaced with the information from Google Places
 * This way, the information will remain current. When the app is tied into Firebase, then the
 * Firebase dataset will be updated with the latest information from the Google Places query.
 *
 * Typically, once a place has been queried and updated, Google Places will then be queried
 * once every per day to ensure the information remains accurate. This assumes Google Places
 * has the best information that is easily accessible.
 *
 */
var places = [
    {
        name: "Cooperstown Dreams Park",
        id: 1,
        description: 'Concessions are reasonable, parking is more than adequate and plan on ' +
        'doing some walking during the week. Fields 11-14 are a hike. Transports are available' +
        ' needing a ride.',
        type: null,
        phone: '704-630-0050',
        location: {
            latitude: 42.63999,
            longitude: -74.96033
        },
        address: {
            street: '4550 NY-28',
            city: 'Milford',
            state: 'NY'
        },
        url: 'http://cooperstowndreampark.com',
        visibility: true,
        category: 'attraction'
    },
    {
        name: 'Cooperstown Bat Company',
        id: 4,
        description: 'Take a tour of the factory. Also, the downtown store is a great place to get your trinkets.',
        type: null,
        phone: '607-547-2415',
        location: {
            latitude: 42.70087,
            longitude: -74.92536
        },
        address: {
            street: '118 Main St',
            city: 'Cooperstown',
            state: 'NY'
        },
        url: 'http://www.cooperstownbat.com',
        visibility: true,
        category: 'attraction'
    },
    {
        name: "Doubleday Field",
        id: 2,
        description: 'Checkout a baseball game just about any time when the sun is shining.',
        type: null,
        phone: '607-547-2270',
        location: {
            latitude: 42.6993,
            longitude: -74.92676
        },
        address: {
            street: '1 Doubleday Court',
            city: 'Cooperstown',
            state: 'NY'
        },
        url: 'http://www.thisiscooperstown.com/attractions/doubleday-field',
        visibility: true,
        category: 'attraction'
    },
    {
        name: "Evergreen Valley",
        id: 3,
        description: 'Single family home with 4 bedrooms and 2 full baths.',
        type: 'SFH',
        phone: '',
        location: {
            latitude: 42.68484,
            longitude: -74.86451
        },
        address: {
            street: '1885 Highway 166',
            city: 'Cooperstown',
            state: 'NY'
        },
        url: 'https://www.cooperstownny.com/dreamspark-lodging/rentals-567.html',
        cost: '1800',
        visibility: true,
        category: 'accommodation'
    },
    {
        name: 'Holiday Inn Express & Suites Cooperstown',
        id: 5,
        description: '<ul>' +
                        '<li>about 3 minutes from park.  SO EASY & CONVENIENT !!!!!</li>' +
                        '<li>it had free wifi so could get reception without issues</li>' +
                        '<li>had a room with 2 queens, 1 bath ($250/ night) Note:  if cancelled reservation by 11 am would only charge $75 so good if early loss & wanted to head home</li>' +
                        '<li>hotel had  indoor pool, hot tube, great hot breakfast, grills for families/teams, small playground and baseball field.  Lobby was huge with 2 TVs, easy for hanging out.</li>' +
                        '<li>Beds & shower were great !!!!  Two nights a coach or kid or two would come over & take a REAL shower</li>' +
                        '<li>small shopping center 1 minute away with bank, McDonalds, Super market, Chinese restaurant, etc...</li>' +
                     '</ul>',
        type: 'HOTEL',
        phone: null,
        location: {
            latitude: 42.65337,
            longitude: -74.96278
        },
        address: {
            street: null,
            city: null,
            state: null
        },
        url: null,
        visibility: true,
        category: 'accommodation'
    }
];

ko.bindingHandlers.slideVisible = {
    update: function (element, valueAccessor, allBindingsAccessor) {
        // console.log(element);
        // console.log(valueAccessor);
        // console.log(allBindingsAccessor);
        var value = valueAccessor();
        var allBindings = allBindingsAccessor();

        var valueUnwrapped = ko.utils.unwrapObservable(value);

        var duration = allBindings.slideDuration || 400;
        // console.log('duration = ' + duration);

        if (valueUnwrapped === true) {
            $(element).animate({ left: 1 }, { duration: duration });
        }
        else {
            $(element).animate({ left: -200 }, { duration: duration });
        }
    }
};

function clearMarkerAnimation(locations) {
    locations().forEach(function(e) {
        // If e.marker is an object and not set to null, clear animation.
        if (utils.isObject(e.marker)) {
            gMaps.clearMarkerAnimation(e.marker);
        }
    });
}

function unselectAllLocations(locations) {
    locations().forEach(function(e) {
        e.isSelected(false);
    });
}

module.exports = PlacesViewModel;

function PlacesViewModel(emitter) {
    var self = this;

    self.emitter = emitter;

    self.markerListVisible = ko.observable(false);
    self.searchBarVisible = ko.observable(true);
    self.isSelected = ko.observable(false);

    self.placeFilter = ko.observable('');

    function LocationViewModel(data) {
        ko.mapping.fromJS(data, mapping, this);

        this.getLocation = function () {
            return { lat: this.latitude(), long: this.longitude() };
        };
    }

    function AddressViewModel(data) {
        ko.mapping.fromJS(data, mapping, this);
    }

    var mapping = {

        create: function(options) {
            var subMapping = {
                'location': {
                    create: function (options) {
                        return new LocationViewModel(options.data);
                    }
                },
                'address': {
                    create: function (options) {
                        return new AddressViewModel(options.data);
                    }
                }
            };
            var vm = ko.mapping.fromJS(options.data, subMapping);

            // Add selected attribute
            vm.isSelected = ko.observable(false);

            // Subscribe to visibility attribute
            // Change visibility of icon.
            vm.visibility.subscribe(function(newValue) {
                if (newValue) {
                    vm.marker.setVisible(true);
                }
                else {
                    vm.marker.setVisible(false);
                }
            });

            // Add google.maps.Marker holder.
            vm.marker = null;

            vm.distanceToDP = ko.observable('');
            vm.travelTimeToDP = ko.observable('');

            vm.googlePlacesDetail = undefined;

            /**
             * Sets the distance attribute on a place.
             * @param result
             */
            vm.setDistance = function(result) {
                if (result !== undefined) {
                    // Set distance
                    console.log(result);
                    vm.distanceToDP(result.rows[0].elements[0].distance.text);

                    // Set Travel Time
                    vm.travelTimeToDP(result.rows[0].elements[0].duration.text);
                }

            };

            vm.setGooglePlacesDetail = function(result) {
                if (result !== undefined) {
                    vm.googlePlacesDetail = result;
                }
            };

            // Create the content string for the google maps info window.
            vm.content = '<div id="infowindow-container">' +
                            '<div class="infowindow-name">' + vm.name() + '</div>' +
                            '<div class="infowindow-description">' + vm.description() + '</div>' +
                            '<div class="infowindow-address"><address>' + vm.address.street() + '<br>' +
                            vm.address.city() + ', ' + vm.address.state() +
                            '</address>' +
                            '</div>' +
                            '<div class="infowindow-distance" data-bind="text: distanceToDP"></div>' +
                         '</div>';
            return vm;
        }
    };

    self.locations = ko.observableArray();

    ko.mapping.fromJS(places, mapping, self.locations);

    /**
     * @description Retrieves filtered list of locations.
     */
    self.filteredPlaces = ko.computed(function() {
        var searchFilter = self.placeFilter().toLowerCase();
        var placesFound;
        if (!searchFilter) {
            // No text has been entered in the search input.
            // return self.locations();
            placesFound = self.locations();
        }
        else {
            // return ko.utils.arrayFilter(self.locations(), function(place) {
            placesFound = ko.utils.arrayFilter(self.locations(), function(place) {
                return ko.utils.stringStartsWith(place.name().toLowerCase(), searchFilter) && place.marker !== null;
            });
        }
        console.log(typeof placesFound);
        return placesFound;
    });

    /**
     * @description Subscribes to filteredPlaces to update the markers on the map.
     */
    self.filteredPlaces.subscribe(function(change) {
        console.log(change);
        var changeIds = {};
        var notChangedIds = {};

        if (self.placeFilter().length > 0) {
            // User is filtering the list.

            change.forEach(function(loc) {
                // First set all change elements back to visible markers.
                console.log(loc.marker);
                if (loc.marker !== null) loc.visibility(true);

                // Capture filtered locations id for reference.;
                changeIds[loc.id()] = loc;
            });

            // Get locations that are not currently in the filteredPlaces list
            notChangedIds = self.locations().filter(function(loc) {
                return !(loc.id() in changeIds);
            });

            // Set the visibility of the markers to false.
            notChangedIds.forEach(function(m) {
                if (m.marker !== null) {
                    m.marker.setVisible(false);
                }
            });
        }
        else {
            // Not filtering the list make all markers visible.
            self.locations().forEach(function(m) {
                if (m.marker !== null) {
                    m.marker.setVisible(true);
                }
            });
        }
    });

    // Bound to hamburger element to toggle search bar.
    self.toggleSearchBar = function (data) {
        self.searchBarVisible(!self.searchBarVisible());
    };


    // console.log(this.locations());

    self.visibleLocations = ko.computed(function () {
        return ko.utils.arrayFilter(self.locations(), function (p) {
            // console.log(p);
            return p.visibility();
        });
    });

    self.selectedStatus = ko.pureComputed(function() {
        return self.isSelected() ? 'selected' : '';
    });

    /**
     *
     * @param data
     */
    self.focusLocation = function (data) {
        console.log('focusLocation' + data);
        unselectAllLocations(self.locations);
        clearMarkerAnimation(self.locations);
        gMaps.animateMarker(data);
        data.isSelected(true);
    };

    /**
     * Sets the marker attribute on each location after google.maps has loaded.
     *
     */
    self.setMarkers = function() {
        console.log('loaded event triggered');

        var dreamsPark;
        self.locations().forEach(function (e) {
            if (e.visibility()) {
                gMaps.addMarker(e);
                if (e.name() === 'Cooperstown Dreams Park') {
                    console.log('Set dreamsPark');
                    dreamsPark = e;
                }
                else {
                    gMaps.distanceToDreamsPark(dreamsPark, e, e.setDistance);
                }

                gMaps.queryPlaces(e.name(), function() {});
            }
        });
    };

    self.emitter.on('googlemapsloaded', function() {
        console.log('bind Places Triggered');
        self.setMarkers();
    });
}
