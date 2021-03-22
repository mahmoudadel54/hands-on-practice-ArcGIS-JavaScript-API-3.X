var map;

require([
  "esri/map",
  "esri/request",
  "esri/config",
  "esri/geometry/projection",
  "esri/layers/FeatureLayer",
  "esri/InfoTemplate",
  "dojo/domReady!",
], function (
  Map,
  esriRequest,
  esriConfig,
  projection,
  FeatureLayer,
  InfoTemplate
) {
  // Use CORS to get earthquakes geojson
  esriConfig.defaults.io.corsEnabledServers.push("earthquake.usgs.gov"); // supports CORS
  let UFOs_ColoradoURL =
    "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services/UFOs_Colorado/FeatureServer/0";
  let UFOs_ColoradoLayer = new FeatureLayer(UFOs_ColoradoURL, {
    showLabels: true,
    outFields: ["*"],
    infoTemplate: new InfoTemplate({
      content: "${*}",
    }),
  });
  map = new Map("mapDiv", {
    zoom: 5,
    center: [-110, 38],
    basemap: "national-geographic",
  });

  map.addLayer(UFOs_ColoradoLayer);
  map.on("click", (e) => console.log(e.mapPoint.spatialReference));
  // send request to retrieve some data
  var request = esriRequest({
    url: "http://api.flickr.com/services/feeds/photos_public.gne",
    content: {
      tags: "earthquakes,us",
      tagmode: "all",
      format: "json",
    },
    callbackParamName: "jsoncallback", //You need to set this property when requesting for data available in JSONP format.
    // For the flickr service, the value should be "jsoncallback", as specified in Flickr's documentation.
    // For ArcGIS services, callbackParamName is always "callback".
  });

  //another request
  //   var request = esriRequest({
  //     url: "https://jsonplaceholder.typicode.com/users",
  //     handleAs: "json",
  //     callbackParamName: "callback",
  //   })

  //another request to get all layers in arcGIS
  var requestGetAllLayers = esriRequest({
    url: "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services",
    content: {
      f: "json",
    },
    handleAs: "json",
    callbackParamName: "callback",
  });

  // request all earthquakes for last week as geojson
  const earthquakeDataRequest = esriRequest({
    url:
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
    handleAs: "json",
  });

  function requestSucceeded(data) {
    console.log("Data: ", data); // print the data to browser's console
  }

  function requestFailed(error) {
    console.log("Error: ", error);
  }

  request.then(requestSucceeded, requestFailed);
  requestGetAllLayers.then(requestSucceeded, requestFailed);
  earthquakeDataRequest.then(requestSucceeded, requestFailed);
  console.log(projection.isSupported());
  console.log(projection);
});
