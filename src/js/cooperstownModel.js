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
var weather = require('./weather');
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
        if (evaluatorResult && (typeof evaluatorResult.done === "function")) { // Async
            result.inProgress(true);
            currentDeferred = $.Deferred().done(function(data) {
                result.inProgress(false);
                console.log(data);
                result(data);
            });
            evaluatorResult.done(currentDeferred.resolve);
        } else {// Sync
            result(evaluatorResult);
        }
    });

    return result;
}

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
     * Filtered list of Available Places.
     */
    this.visiblePlaces = ko.computed(this._isVisible, this);

    this.filter = ko.observable('').publishOn('filterPlaces').extend({ rateLimit: 100 });

    //this.filter.subscribe(function(test) {
    //    console.log(test);
    //});

    // this.filter = ko.observable('').subscribeTo('filterPlaces');

    this.filteredPlaces = ko.computed(this._filtered, this).publishOn('filteredList');

    this.filteredPlaces.subscribe(this._filterSubscribe, this);

    this.addLocation = ko.observable().subscribeTo('addPlace');

    this.addLocation.subscribe(this.addPlace,this);

    this.selectedPlace = ko.postbox.subscribe('selectedPlace', function(e) {
        if (e.isSelected()) {
            self.curatedPlaces().forEach(function (p) {

                p.isSelected(false);

            });
            e.isSelected(true);
        }
    });

    /**
     * Google Place API List of Places
     */
        // this.googlePlaces = ko.observableArray([]);
        // this.googlePlaces = ko.computed(this._autoplaces, this);

    this.isFiltered = ko.observable(false);
    this.filter.subscribe(function(update) {
        console.log(update);
        if (update.length > 0) {
            self.isFiltered(true);
        }
        else {
            self.isFiltered(false);
        }
    });


    this.googlePlaces = ko.observableArray([]);
    this.filter.subscribe(getPlacesComputed(function() {
        var self = this;
        var searchFilter = this.filter().trim().toLowerCase();

    //// Query Google Nearby Search for searchFilter
        return GoogleMaps.PlacesService.autoCompleteService(searchFilter)
            .then(function(result) {
                console.log('Search Filter = ' + searchFilter);
                console.log(result);
                var results = [];
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
                    ko.utils.arrayForEach(self.googlePlaces(), function(place) {
                        place.isVisible(false);
                    });
                    results = [];
                }
                self.googlePlaces(results);
            });

    }, this));

    this.cooperstownWeather = weather.latest();
};

CooperstownViewModel.prototype.loadBindings = function(bindto) {
    ko.applyBindings(this);
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
    else {
        console.log('++' + place + '++');
    }

    // On initial load, the places list will not show. Force an update
    // by notifying subscribers to the filter
    this.filter.notifySubscribers();
    this.filteredPlaces.notifySubscribers();
 };

CooperstownViewModel.prototype.loadSavedPlaces = function(place) {
    if (Object.prototype.toString.call(place) === '[object Object]') {
        var tPlace = new Place(place, 'saved');
        this.curatedPlaces().push(tPlace);
        this.currentPlace(tPlace);
        // On initial load, the places list will not show. Force an update
        // by notifying subscribers to the filter
        this.filter.notifySubscribers();
        this.filteredPlaces.notifySubscribers();
    }
};

CooperstownViewModel.prototype._filtered = function() {
    var searchFilter = this.filter().trim().toLowerCase();
    var placesFound;

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
    console.log(placesFound);
    return placesFound;
};

CooperstownViewModel.prototype.focusLocation = function(data) {
    // First set isSelected to false for all places
    this.curatedPlaces().forEach(function (p) {
        p.isSelected(false);
    });
    this.currentPlace(data);
    // Set this elements isSelected to true;
    data.isSelected(true);

    return true;
};

CooperstownViewModel.prototype._filterSubscribe = function(newValue) {
    this.curatedPlaces().forEach(function(p) {
        if (p in newValue) {
            console.log(p);
        }
    });
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


module.exports = new CooperstownViewModel();
