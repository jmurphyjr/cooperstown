## Cooperstown, New York

[Cooperstown, New York](https://en.wikipedia.org/wiki/Cooperstown,_New_York) is located in the Leatherstocking Country of Central New York State.
 It is home to the National Baseball Hall of Fame and Museum, as well as [Cooperstown Dreams Park](http://www.cooperstowndreamspark.com/), the self proclaimed _Crown Jewel Of Youth Baseball_.
 
 
## Installation

To utilize this application, perform the following:

  1. Clone this repository: `git clone git@github.com:jmurphyjr/cooperstown.git'
  2. Execute: cd cooperstown or whichever directory the repo was cloned to
  3. Execute: npm install
  4. Execute: gulp
  5. Visit in a browser: http://localhost:3000
 
## Project Description
 
This is _Project 5-1: Neighborhood Map Project_ of the Udacity Front-End Nanodegree.

### Requirements

| Criteria                | Requirements                 | To Exceed Requirements |
| ------------------------|------------------------------|------------------------|
| Interface Design        | All application components render on-screen in a responsive manner, usable across modern desktop, tablet and phone browsers. | All application components are integrated into a cohesive and enjoyable user experience.
| App Functionality       | Each of the following application components function appropriately without error as described.<br><br>**Search Bar:** Filters both the locations in the list view and the markers on the map.<br><br>**List View:** Show locations that have been searched for, additionally clicking on a location activates its associated map marker.<br><br>**Map:** Shows each searched location as a marker, each marker can be clicked and shows unique information about a location in an infoWindow. Markers should animated when clicked (e.g. bouncing, color change) | Unique functionality is added to application components, beyond the minimum required functionality.
| App Architecture        | Code is properly separated based upon Knockout's best practices (following an MVVM pattern, avoiding updating the DOM manually, using observables rather than forcing refreshes manually, etc). Student hard codes at least 5 locations in their model. | Student incorporates a build process allowing for production quality, minified code, to be delivered to the client.<br><br>Data persists when the app is closed and reopened, either through localStorage or an external database (e.g. Firebase).<br><br>In lieu of hardcoding locations, student populates a dynamic model with information retrieved from an API.
| Asynchronous Data Usage | Application utilizes Google's Map API and at least one additional third-party "data API".<br><br>All data requests are retrieved in an asynchronous manner.<br><br>Data requests that fail are handled using common fallback techniques (i.e. AJAX error or fail methods). _Note: You do not need to handle cases where the user goes offline._ | Student includes additional third-party data sources beyond the minimum required.
| Geospatial / Map Functionality | A geospatial/map representation of identified locations is provided, runs error free and is presented in a usable and responsive manner.<br><br>Markers are clickable, and change styling to indicate their selected state. | Student styles different markers in different (and functionally-useful) ways, depending on the data set. 
| Location Details Functionality | Functionality providing additional data about a location is provided, runs without errors and is presented in a usable and responsive manner. | Not applicable
| Search Functionality    | A search function is provided, runs error free and is present in a usable and responsive manner. | Student clearly has researched and implemented addtional optimizations that improve the performance and user experience of the search functionality (keyboard shortcuts, autocomplete functionality, searching of multiple fields, etc.).  
| List View Functionality | A "list view", or some other variation of browsing the content (beyond search/map) is provided, runs error free and is presented in a usable and responsive manner. | Not applicable
| Code Quality            | Code is ready for personal review and neatly formatted. | Not applicable
| Comments                | Comments are present and effectively explain longer code procedures. | Comments are thorough and concise. Code is self documenting.
| Documentation           | A README file is included detailing all steps required to successfully run the application. | Not applicable

### Project Design

In addition to utilizing the [Knockout.js](http://knockoutjs.com/) framework, the author incorporated a 
build process utilizing [Browserify](http://browserify.org/). Browserify is a tool that allows writing
client-side code like it is for node.js, typically reserved for the server. This allowed for concise code
packaged into smaller files.

#### Project Directory Structure Layout

The directory structure is:

```
  $root
  
  -> src      // Where development primarily occurs
    -> js/
    -> css/
    
  -> dist     // Result of building project, mimics src directory structure.
  
  -> gulp     // Gulp tasks are stored in this directory
    -> tasks
```


#### Classes Required

The following


### Attributions

* [Baseball Map Icon Provided by: Designed by Freepik](http://www.freepik.com/free-vector/sport-balls_800206.htm)
