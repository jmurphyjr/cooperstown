/**
 * Created by jack on 11/5/15.
 */
/* jshint node: true */
'use strict';

var ko = require('knockout');
ko.mapping = require('knockout-mapping');
var $ = require('jquery');
var gMaps = require('./google.js');

var places = [
    {
        name: "mapCenter",
        id: 0,
        location: {
            latitude: 42.6638889,
            longitude: -74.954252
        },
        filterType: null,
        visibility: false
    },
    {
        name: "Cooperstown Dreams Park",
        id: 1,
        description: 'Concessions are reasonable, parking is more than adequate and plan on ' +
        'doing some walking during the week. Fields 11-14 are a hike. Transports are available' +
        ' needing a ride.',
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
        filterType: 'poi'
    },
    {
        name: "Doubleday Field",
        id: 2,
        description: 'Checkout a baseball game just about any time when the sun is shining.',
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
        filterType: 'poi'
    },
    {
        name: "Green Valley",
        id: 3,
        type: 'SFH',
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
        filterType: 'accommodation'
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
        gMaps.clearMarkerAnimation(e.marker);
    });
}

module.exports = PlacesViewModel;

function PlacesViewModel() {
    var self = this;

    self.searchBarVisible = ko.observable(true);
    self.isSelected = ko.observable(false);

    self.testFunction = function (data) {
        console.log(data);
        self.searchBarVisible(!self.searchBarVisible());
    };

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

        // 'location': {
        //     create: function (options) {
        //         return new LocationViewModel(options.data);
        //     }
        // },
        // 'address': {
        //     create: function (options) {
        //         return new AddressViewModel(options.data);
        //     }
        // }
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

            vm.selectedStatus = ko.pureComputed(function() {
                return vm.isSelected() ? 'selected' : '';
            });

            return vm;
        }
    };

    self.locations = ko.observableArray();

    ko.mapping.fromJS(places, mapping, this.locations);

    console.log(this.locations());

    self.visibleLocations = ko.computed(function () {
        return ko.utils.arrayFilter(self.locations(), function (p) {
            return p.visibility();
        });
    });

    self.selectedStatus = ko.pureComputed(function() {
        return self.isSelected() ? 'selected' : '';
    });

    self.focusLocation = function (data) {
        console.log(data.marker);
        clearMarkerAnimation(self.locations);
        gMaps.animateMarker(data.marker);
        data.isSelected(true);
    };

    self.locations().forEach(function (e) {
        var marker;
        // console.log(e);
        var loc = e.location.getLocation();
        // console.log(loc);
        marker = gMaps.addMarker(loc);
        e.marker = marker;
    });
}
