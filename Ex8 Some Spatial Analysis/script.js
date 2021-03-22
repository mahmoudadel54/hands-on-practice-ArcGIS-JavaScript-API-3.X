var map, countyNameInput, countyNameValue, bufferInput, bufferDistValue, runBtn;
require([
  "esri/map",
  "esri/layers/FeatureLayer",
  "esri/tasks/query",

  "esri/tasks/QueryTask",
  "esri/Color",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",

  "esri/graphicsUtils",
  "esri/InfoTemplate",

  "dojo/domReady!",
], function (
  Map,
  FeatureLayer,
  Query,
  QueryTask,
  Color,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  graphicsUtils,
  InfoTemplate
) {
  map = new Map("mapDiv", {
    basemap: "streets",
    zoom: 3,
    center: [-114, 25],
  });

  let usaCountiesUrl =
    "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services/cb_2017_us_county_500k_v2/FeatureServer/0";

  let airportURL =
    "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services/airports/FeatureServer/0";

  let usaCountriesLayer = new FeatureLayer(usaCountiesUrl, {
    outFields: ["*"],
  });
  let airportLayer = new FeatureLayer(airportURL, {
    outFields: ["*"],
    featureReduction: {
      type: "cluster",
    },
    definitionExpression:
      "iso_country='US' and continent='NA' and type='small_airport'",
  });

  map.addLayers([usaCountriesLayer, airportLayer]);

  //dom input elements
  countyNameInput = document.getElementById("countyNameInput");
  bufferInput = document.getElementById("bufferInput");
  runBtn = document.getElementById("Run-btn");
  //query task
  var qCounty = new Query();
  var qtCounty = new QueryTask(usaCountiesUrl);
  runBtn.addEventListener("click", () => {
    if (countyNameInput.value !== "" && bufferInput.value !== "") {
      qCounty.where = `FID=${parseFloat(countyNameInput.value)}`;
      qCounty.returnGeometry = true;
      qtCounty.execute(
        qCounty,
        (e) => {
          let fset = e.features[0];
          var geom = fset.geometry;
          let qAirport = new Query();
          let qtAirport = new QueryTask(airportURL);
          qAirport.outFields = ["*"];
          qAirport.returnGeometry = true;
          qAirport.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
          qAirport.geometry = geom;
          qAirport.distance = parseFloat(bufferInput.value);
          qAirport.units = "miles";

          qtAirport.execute(
            qAirport,
            (e) => {
              map.graphics.clear();
              let fset = e.features;
              fset.forEach((feat) => {
                feat.setSymbol(
                  new SimpleMarkerSymbol(
                    SimpleMarkerSymbol.STYLE_CIRCLE,
                    10,
                    new SimpleLineSymbol(
                      SimpleLineSymbol.STYLE_SOLID,
                      new Color([255, 0, 0]),
                      1
                    ),
                    new Color([50, 255, 255])
                  )
                );
                feat.setInfoTemplate(new InfoTemplate());
                map.graphics.add(feat);
              });
              let extentOfFeats = graphicsUtils.graphicsExtent(fset);
              map.setExtent(extentOfFeats);
            },
            (err) => console.log(err)
          );
        },
        (err) => console.log(err)
      );
    }
  });
});
