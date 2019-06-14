// Store our API endpoint inside queryUrl for last 7 days Earthquake data
var linkUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=NOW-7 days&endtime=" +
  "&maxlongitude&minlongitude&maxlatitude&minlatitude";
  //"&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude&minlatitude";


// Adding tile layer https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}
var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets-satellite",
  accessToken: API_KEY
});

var graymap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
});

var outdoor = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});

// Create a baseMaps object
var baseMaps = {
  "Satellite": satellite,
  "Grayscale": graymap,
  "Outdoors": outdoor,  
};
// Create a new group for earthquake
var earthquake = new L.LayerGroup();

// Function that will determine the color of a Earthquake magnitude
function chooseColor(m) {
  
  if (m < 1) {
    return "lightgreen";
  }
  else if (m < 2 ) {
    return "lightblue";
  }
  else if (m < 3 ) {
    return "orange";
  }
  else if (m < 4 ) {
    return "yellow";
  }
  else if (m < 5 ) {
    return "red";
  }
  else {
    return "purple";
  }
};
// function markerSize(mag) {
//   return mag * 2;
// };

// Grabbing GeoJSON data..
d3.json(linkUrl, function(data) {
  console.log(data.features);

  var geoData = data.features;

  for (i = 0; i < geoData.length; i++){

    Lat = geoData[i].geometry.coordinates[1];
    Long = geoData[i].geometry.coordinates[0];
    Loc = [Lat, Long]
    Mag = geoData[i].properties.mag;
    URL = geoData[i].properties.url;
    Title = geoData[i].properties.title;

    L.circle(Loc,{
      fillOpacity: 0.7,
      color: chooseColor(Mag),
      fillColor: chooseColor(Mag),
      weight : 1,
      // Adjust radius
      radius: (Mag * 20000)
    }).bindPopup("<h1>" + Title + "</h1> <hr> <p1>Detail Link: " + URL + "</p1>").addTo(earthquake)
  };
  console.log(Loc);
  console.log(Mag);

  // Create the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var ranges = ["0 - 1","1 - 2","2 - 3","3 - 4","4 - 5","5+   "];
    var colors = ["lightgreen","lightblue","orange","yellow","red","purple"];
    var lbls = [];

    ranges.forEach(function(range, index) {
      lbls.push("<li style=\"background-color: " + colors[index] +"\"> " + range + "</li>");
    });

    div.innerHTML += "<ul>" + lbls.join("") + "</ul>";
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);  

});

// Link for boundary layers data 
var LinkBoundUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Create a new group for boundary line
var boundary = new L.LayerGroup();

// Grabbing GeoJSON data..
d3.json(LinkBoundUrl, function(pdata) {  
  console.log(pdata.features);
  L.geoJSON(pdata.features, {
    style: function (geoJsonFeature) {
        return {
            weight: 2,
            color: 'blue'
        }
    },
  }).addTo(boundary);
});

// Create an overlay object
var overlayMaps = {
  "Fault Line": boundary,
  "Earthquake" : earthquake
};

// Define a map object
var myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 3,
  layers: [satellite,boundary,earthquake]
  
});
// Create a layer control
// Pass in our baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps,overlayMaps).addTo(myMap);



