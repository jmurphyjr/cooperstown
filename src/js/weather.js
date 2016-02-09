/**
 * Created by jack on 2/4/16.
 */

'use strict';


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


var WeatherModel = function() {
    var dateStr = ko.observable('');
    var minTemp = ko.observable('');
    var maxTemp = ko.observable('');
    var description = ko.observable('');
    var icon = ko.observable('');
};


var weatherViewModel = function() {
    var weather = ko.observableArray([]);

    var formatWeather = function(j) {
        console.log(j);
        var len = j.list.length;

        for (var i = 0; i < len; i++) {
            date = new Date(j.list[i].dt * 1000);
            weather.push(new WeatherModel({
                date: (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear(),
                min: j.list[i].temp.min,
                max: j.list[i].temp.max,
                desc: j.list[i].weather[0].description,
                icon: 'http://openweathermap.org/img/w/' + j.list[i].weather[0].icon + '.png'
            }));
        }
    };

};

window.addEventListener('load', function () {
    LatestWeather();
});
