/**
 * Created by jack on 2/4/16.
 */

'use strict';

var ko = require('knockout');

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

var WeatherModel = function(data) {

    this.date = data.date;
    this.min = data.min;
    this.max = data.max;
    this.desc = data.desc;
    this.icon = data.icon;
};


var weatherViewModel = function() {
    var self = this;
    self.latest = ko.observableArray([]);

    var formatWeather = function(j) {
        console.log(j);
        var len = j.list.length;

        for (var i = 0; i < len; i++) {
            var date = new Date(j.list[i].dt * 1000);
            // Output Date as Mon, Feb 5
            self.latest.push(new WeatherModel({
                // date: (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear(),
                date: (DOW[date.getDay()] + ', ' + MONTH[date.getMonth()] + ' ' + date.getDate()),
                min: j.list[i].temp.min,
                max: j.list[i].temp.max,
                desc: j.list[i].weather[0].description,
                icon: 'http://openweathermap.org/img/w/' + j.list[i].weather[0].icon + '.png'
            }));
        }
    };

    /**
     * Load Open Weather for Cooperstown.
     */
    var LatestWeather = function() {
        var locId = '5113664';
        var key = 'eb4517278632126592d242295796967f';
        var apiUrl = 'http://api.openweathermap.org/data/2.5/forecast/daily?id=' + locId + '&appid=' + key + '&units=imperial';
        // http://api.openweathermap.org/data/2.5/forecast?id=5113664&appid=eb4517278632126592d242295796967fimperial&units=

        // http://api.openweathermap.org/data/2.5/weather?id=5113664&appid=eb4517278632126592d242295796967f&units=imperial

        window.fetch(apiUrl, {
            method: 'get'
        }).then(function(response) {
            // console.log(response.json());
            return response.json();
        }).then(function(j) {
            formatWeather(j);
        }).catch(function(err) {
            console.log(err);
            return err;
        });
    };

    LatestWeather();
};

module.exports = new weatherViewModel();
