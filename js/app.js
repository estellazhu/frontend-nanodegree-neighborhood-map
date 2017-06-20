// location data
var initLocations = [
  {
    title: 'Google',
    coordinates: {lat: 40.7413549, lng: -73.9980244}
  },
  {
    title: 'Whole Foods Market',
    coordinates: {lat: 40.7449298, lng: -73.9953092}
  },
  {
    title: 'Union Square, Manhattan',
    coordinates: {lat: 40.735512, lng: -73.990715}
  },
  {
    title: 'Path Rail System',
    coordinates: {lat: 40.737240, lng: -73.996694}
  },
  {
    title: 'New York University Libraries',
    coordinates: {lat: 40.729427, lng: -73.997194}
  }
];

// wikipedia api request url
var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=1&search=';

// location class
var Location = function(data, map) {
  var self = this;
  this.title = ko.observable(data.title);
  this.coordinates = ko.observable(data.coordinates);
  this.marker = {};
  this.info = '';

  // info search using wikipedia api
  $.ajax({
    url: wikiUrl + data.title,
    dataType: 'jsonp'
  }).done(function(result) {
    self.info = '<h3>' + self.title() + '</h3>' + '<p>' + result[2][0] + '</p><p><a href=' + result[3][0] + ' target="blank">Read more on Wikipedia</a><p>';
  }).fail(function(){
    alert("Can't get info from Wikipedia =(");
  });
};

// input value for filter
var searchString = ko.observable('');


// ViewModel
var ViewModel = function() {
  var self = this;

  // create the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: initLocations[0].coordinates,
    zoom: 14
  });

  // create initial location list
  this.locationList = ko.observableArray([]);
  initLocations.forEach(function(item){
    self.locationList.push(new Location(item));
  });

  // initial markers and map bounds
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < this.locationList().length; i++){
    // create marker for each location
    this.locationList()[i].marker = new google.maps.Marker({
      map: map,
      position: this.locationList()[i].coordinates(),
      title: this.locationList()[i].title(),
      animation: google.maps.Animation.DROP,
    });
    bounds.extend(this.locationList()[i].marker.position);
  }
  map.fitBounds(bounds);

  // filter location list and markers
  this.filteredList = ko.computed(function(){
    var filtered = [];
    this.locationList().forEach(function(item){
      if(!searchString() || item.title().toLowerCase().indexOf(searchString().toLowerCase()) !== -1){
        filtered.push(item);
        item.marker.setVisible(true);
      } else {
        item.marker.setVisible(false);
      }
    });
    return filtered;
  }, this);

  // set info window
  var infoWindow = new google.maps.InfoWindow();

  // add event listener to open infoWindow at each marker
  this.locationList().forEach(function(loc){
    google.maps.event.addListener(loc.marker, 'click', function () {
      self.clickLocation(loc);
    });
  });

  // show animation and infoWindow when click on location list or markers
  this.clickLocation = function(loc){
    // add marker animation;
    if (loc.marker.getAnimation() === null) {
      loc.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){
        loc.marker.setAnimation(null);
      }, 500);
    } else {
      loc.marker.setAnimation(null);
    }
    // show infoWindow
    if(infoWindow.marker != loc.marker) {
      infoWindow.marker = loc.marker;
      infoWindow.setContent(loc.info);
      infoWindow.open(map, loc.marker);
    }
  };
}; // viewModel

// Google map api callback
function initMap() {
  ko.applyBindings(new ViewModel());
};
