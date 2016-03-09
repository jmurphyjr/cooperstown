/**
 * Created by jack on 11/22/15.
 */

/* jshint node: true */

'use strict';
/**
 * Bring in requirements to support this module.
 */
var $ = require('jquery');
var ko = require('knockout');
ko.postbox = require('knockout-postbox');
ko.options.deferUpdates = true;
var Place = require('./place');
var GoogleMaps = require('./google');
// var weather = require('./weather');

/**
 * Reference: https://github.com/knockout/knockout/wiki/asynchronous-dependent-observables
 *
 * @param evaluator
 * @param owner
 */
function getPlacesComputed(evaluator, owner) {
    var result = ko.observable();
    var currentDeferred;
    result.inProgress = ko.observable(false); // Track whether we're waiting for a result

    ko.computed(function() {
        // Abort any in-flight evaluation to ensure we only notify with the latest value
        if (currentDeferred) { currentDeferred.reject(); }

        var evaluatorResult = evaluator.call(owner);
        // Cope with both asynchronous and synchronous values
        if (evaluatorResult && (typeof evaluatorResult.done === 'function')) { // Async
            result.inProgress(true);
            currentDeferred = $.Deferred().done(function(data) {
                result.inProgress(false);
                result(data);
            });
            evaluatorResult.done(currentDeferred.resolve);
        } else {// Sync
            result(evaluatorResult);
        }
    });

    return result;
}

var WeatherModel = function(data) {

    this.date = data.date;
    this.min = data.min;
    this.max = data.max;
    this.desc = data.desc;
    this.icon = data.icon;
};

var DOW = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat'
};

var MONTH = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sep',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec'
};



var CooperstownViewModel = function() {
    var self = this;
    if ( !(this instanceof CooperstownViewModel) ) {
        return new CooperstownViewModel();
    }

    /**
     * Current Selected Place
     */
    this.currentPlace = ko.observable().publishOn('currentPlace');

    /**
     * Curated List of Places
     */
    this.curatedPlaces = ko.observableArray([]);

    /**
     * Current Visible Places
     */
    this.visiblePlaces = ko.computed(this._isVisible, this);

    this.placesList = ko.observable(true);

    this.filter = ko.observable('').publishOn('filterPlaces').extend({ rateLimit: 1000 });

    this.filteredPlaces = ko.computed(this._filtered, this);

    this.addLocation = ko.observable().subscribeTo('addPlace');

    this.addLocation.subscribe(this.addPlace,this);

    this.selectedPlace = ko.postbox.subscribe('selectedPlace', function(e) {
        if (e.isSelected()) {
            self.curatedPlaces().forEach(function (p) {

                p.isSelected(false);

            });
            e.isSelected(true);
        }
        if (window.innerWidth < 600) {
            self.placesList(false);
        }
        else {
            self.placesList(true);
        }
    });

    this.isFiltered = ko.observable(false);
    this.filter.subscribe(function(update) {
        self.curatedPlaces().forEach(function (p) {
            p.isSelected(false);
        });

        if (update.length > 0) {
            self.isFiltered(true);
        }
        else {
            self.isFiltered(false);
        }
    }, this);


    this.googlePlaces = ko.observableArray([]);
    this.filter.subscribe(getPlacesComputed(function() {
        var self = this;
        var searchFilter = self.filter().trim().toLowerCase();

    //// Query Google Nearby Search for searchFilter
        return GoogleMaps.PlacesService.autoCompleteService(searchFilter)
            .then(function (result) {
                if (self.isFiltered()) {
                    var searchedPlaces = self._getResults(result);
                    if (self.googlePlaces().length > 0) {
                        self._cleanPlaces(searchedPlaces);
                    }

                    searchedPlaces.forEach(function (place) {
                        if (!self._alreadyExists(place)) {
                            self.googlePlaces.push(new Place(place, 'temp'));
                            // results.push(new Place(place, 'temp'));
                        }
                    });
                }
                else {
                    ko.utils.arrayForEach(self.googlePlaces(), function (place) {
                        place.isVisible(false);
                        place.isSelected(false);
                    });
                    self.googlePlaces([]);
                }
            });

    }, this));

    self.cooperstownWeather = ko.observableArray([new WeatherModel({
        'date': '',
        'min': '',
        'max': '',
        'desc': '',
        'icon': ''
    })]);

    var formatWeather = function(j) {
        var len = j.list.length;
        var latest = [];

        for (var i = 0; i < len; i++) {
            var date = new Date(j.list[i].dt * 1000);
            // Output Date as Mon, Feb 5
            latest.push(new WeatherModel({
                // date: (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear(),
                date: (DOW[date.getDay()] + ', ' + MONTH[date.getMonth()] + ' ' + date.getDate()),
                min: j.list[i].temp.min,
                max: j.list[i].temp.max,
                desc: j.list[i].weather[0].description,
                icon: 'http://openweathermap.org/img/w/' + j.list[i].weather[0].icon + '.png'
            }));
        }
        self.cooperstownWeather(latest);
    };

    /**
     * Load Open Weather for Cooperstown.
     */
    var latestWeather = function() {
        var locId = '5113664';
        var key = 'eb4517278632126592d242295796967f';
        var apiUrl = 'http://api.openweathermap.org/data/2.5/forecast/daily?id=' + locId + '&appid=' + key + '&units=imperial';
        // http://api.openweathermap.org/data/2.5/forecast?id=5113664&appid=eb4517278632126592d242295796967fimperial&units=

        // http://api.openweathermap.org/data/2.5/weather?id=5113664&appid=eb4517278632126592d242295796967f&units=imperial

        window.fetch(apiUrl, {
            method: 'get'
        }).then(function(response) {
            return response.json();
        }).then(function(j) {
            formatWeather(j);
        }).catch(function(err) {
            console.log(err);
            return err;
        });
    };


    this.weatherVisible = ko.observable(false);

    this.weatherVisibleStatus = ko.pureComputed(function() {
        return this.weatherVisible() ? 'weather-visible' : 'weather-removed';
    }, this);


    this.listVisibleStatus = ko.pureComputed(function() {
        return this.placesList() ? 'left-sidebar-visible' : 'left-sidebar-removed';
    }, this);


    this.sidebarToggle = function(up) {

        if (up === 1 && self.weatherVisible() === false) {
            self.placesList(false);
            self.weatherVisible(true);
        }
        else if (up === 2 && self.placesList() === false) {
            self.weatherVisible(false);
            self.placesList(true);
        }
        else {
            self.weatherVisible(false);
            self.placesList(false);
        }
    };
    latestWeather();



};

CooperstownViewModel.prototype.loadBindings = function(arg) {
    if (arg !== undefined) {
        ko.applyBindings(this);
    }
};

CooperstownViewModel.prototype._isVisible = function () {
    return ko.utils.arrayFilter(this.curatedPlaces(), function (p) {
        return p.isVisible();
    });
};

CooperstownViewModel.prototype.addPlace = function(place) {
    if (Object.prototype.toString.call(place) === '[object Object]' && place !== '') {
        // this.curatedPlaces().push(new Place(place, 'new'));
        this.curatedPlaces().push(place);
        place.saveLocation();
    }
 };

CooperstownViewModel.prototype.loadSavedPlaces = function(place) {
    if (Object.prototype.toString.call(place) === '[object Object]') {
        var tPlace = new Place(place, 'saved');
        this.curatedPlaces().push(tPlace);
        this.currentPlace(tPlace);
        // On initial load, the places list will not show. Force an update
        // by notifying subscribers
        this.curatedPlaces.notifySubscribers();
    }
};

CooperstownViewModel.prototype._filtered = function() {
    var searchFilter = this.filter().trim().toLowerCase();
    var placesFound;
    var infoWindow = GoogleMaps.getInfoWindow();
    infoWindow.close();

    if (!searchFilter) {
        placesFound = this.curatedPlaces();
    }
    else {
        placesFound = ko.utils.arrayFilter(this.curatedPlaces(),
            function(place) {
                if ((place.name().trim().toLowerCase().indexOf(searchFilter) === -1) ||
                    (place.category().trim().toLowerCase().indexOf(searchFilter) === -1)) {
                    place.isVisible(false);
                }
                return (place.name().trim().toLowerCase().indexOf(searchFilter) !== -1 ||
                    place.category().trim().toLowerCase().indexOf(searchFilter) !== -1);

            });
    }
    ko.utils.arrayForEach(placesFound, this._makeVisible);
    return placesFound;
};

CooperstownViewModel.prototype.focusLocation = function(data) {
    // First set isSelected to false for all places
    this.curatedPlaces().forEach(function (p) {
        p.isSelected(false);
    });
    this.googlePlaces().forEach(function(p) {
        p.isSelected(false);
    });
    this.currentPlace(data);
    // Set this elements isSelected to true;
    data.isSelected(true);

    return true;
};


CooperstownViewModel.prototype._makeVisible = function(p) {
    p.isVisible(true);
};


/* Methods for implementing the Google Places API Search */

CooperstownViewModel.prototype._alreadyExists = function(place) {
    var found = false;
    ko.utils.arrayForEach(this.googlePlaces(), function(x) {
        if (x.name() === place.name) {
            found = true;
        }
    });
    return found;
};

CooperstownViewModel.prototype._removePlace = function(place) {
    console.log(place);
    ko.utils.arrayForEach(this.googlePlaces(), function(x) {
        if (x.name() === place.name) {
            x.isVisible(false);
            this.googlePlaces.remove(x);
        }
    }.bind(this));
};



CooperstownViewModel.prototype._cleanPlaces = function(searchedPlaces) {

    var i = this.googlePlaces().length;

    while(i--) {
        var found = false;
        var currentPlace = this.googlePlaces()[i];
        searchedPlaces.forEach(function(place) {
            if (place.name === currentPlace.name()) {
                found = true;
            }
        });

        if (!found) {
            currentPlace.isVisible(false);
            this.googlePlaces.remove(currentPlace);
        }
    }
};

CooperstownViewModel.prototype._autoplaces = function() {
    var searchFilter = this.filter().trim().toLowerCase();


    // Query Google Nearby Search for searchFilter
    GoogleMaps.PlacesService.autoCompleteService(searchFilter)
        .then(function(result) {
            console.log('Search Filter = ' + searchFilter);
            var self = this;

            // Filtering using the searchBox
            if (self.isFiltered()) {
                var searchedPlaces = self._getResults(result);
                if (self.googlePlaces().length > 0) {
                    // Removes existing googlePlaces that are not in the current searchFilter
                    self._cleanPlaces(searchedPlaces);
                }

                searchedPlaces.forEach(function(place) {
                    if (!self._alreadyExists(place)) {
                        self.googlePlaces.push(new Place(place, 'temp'));
                    }
                    // }
                });
            }
            else {
                ko.utils.arrayForEach(self.googlePlaces(), function(place) {
                    place.isVisible(false);
                });
                self.googlePlaces([]);
            }
        }.bind(this));
};

/**
 *
 * @param data
 * @returns {*}
 * @private
 */
CooperstownViewModel.prototype._getResults = function(data) {
    var self = this;

    ko.utils.arrayForEach(self.curatedPlaces(), function (p) {
        var i = data.length;

        while (i--) {
            if (data[i].name.trim() === p.name().trim()) {
                // console.log('deleting ' + data[i].name);
                data.splice(i, 1);
            }
        }
    });
    return data;
};


// module.exports = new CooperstownViewModel();
module.exports = CooperstownViewModel;
