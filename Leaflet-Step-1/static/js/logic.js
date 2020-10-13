function createMap(quakeLocations) {

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 12,
    id: "light-v10",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    // "Light Map": lightmap
  };

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Earthquake Locations": quakeLocations
  };

  // Create the map object with options
  var map = L.map("mapid", {
    center: [39.8283, -98.5795],
    zoom: 5,
    layers: [lightmap, quakeLocations]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps).addTo(map);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      depthRanges = [0, 10, 30, 60, 100, 160],
      labels = [];

    // loop through our quake depth intervals and generate a label with a colored square for each interval
    div.innerHTML = "Earthquake</br> Depth (km)</br>"
    for (var i = 0; i < depthRanges.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(depthRanges[i] + 1) + '"></i> ' +
        depthRanges[i] + (depthRanges[i + 1] ? '&ndash;' + depthRanges[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(map);
};
  
function plotQuakes(response) {

  // Get Quake data from the response
  var quakes = response.features;
  
  // var depth = response.features[0].geometry.coordinates[2]

  // Initialize an array to hold bike markers
  var quakeMarkers = [];

  // Loop through the stations array
  for (var i = 0; i < quakes.length; i++) {
    var quake = quakes[i];
    var lon = quake.geometry.coordinates[0];
    var lat = quake.geometry.coordinates[1];
    var depth = quake.geometry.coordinates[2];
    var place = quake.properties.place;
    var date = Date(quake.properties.time);
    var magnitude = quake.properties.mag;
    
    // For each station, create a marker and bind a popup with the station's name
    var quakeMarker = L.circleMarker([lat, lon], {
      color: "black",
      weight: 1,
      fillColor: getColor(depth),
      fillOpacity: 0.85,
      radius: magnitude * 5
    })
      // Truncate the coordinates to 2 decimal places in the popup
      .bindPopup("<h3>Location: " + place + "</h3>" + "<h3>Latitude: " + 
      Math.round((lat + Number.EPSILON) * 100) / 100 + ", Longitude: " + 
      Math.round((lon + Number.EPSILON) * 100) / 100 + "</h3>" + "<h3>Magnitude: " + 
      magnitude + "</h3>" + "<h3>Date: " + date + "</h3>");

    // Add the marker to the quakeMarkers array
    quakeMarkers.push(quakeMarker);
  }

  // Create a layer group made from the bike markers array, pass it into the createMap function
  createMap(L.layerGroup(quakeMarkers));
}

// Returns the circleColor and used to build the legend
function getColor(d) {

  if (d < 10) {
    return "#00FF00";
  }
  else if (d < 30) {
    return "#ADFF2F";
  }
  else if (d < 60) {
    return "#FFFF00";
  }
  else if (d < 100) {
    return "#FFA500";
  }
  else if (d < 160) {
    return "#FF4500";
  }
  else {
    return "#FF0000";
  }
};

// USGS GeoJSON site for all earthquakes in the past week
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform an API call to the USGS site then call a function to create markers for the earthquakes
d3.json(url, plotQuakes);
  