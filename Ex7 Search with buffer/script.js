var map, updateFeature, editToolbar;
require([
  "esri/map",
  "esri/layers/FeatureLayer",
  "esri/layers/ArcGISDynamicMapServiceLayer",

  "esri/tasks/query",

  "dojo/dom",

  "esri/tasks/FindTask",
  "esri/tasks/FindParameters",

  "esri/tasks/IdentifyTask",
  "esri/tasks/IdentifyParameters",

  "esri/InfoTemplate",

  "esri/tasks/QueryTask",
  "esri/dijit/Search",

  "esri/Color",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "dojo/domReady!",
], function (
  Map,
  FeatureLayer,
  ArcGISDynamicMapServiceLayer,
  Query,
  dom,
  FindTask,
  FindParameters,
  IdentifyTask,
  IdentifyParameters,
  InfoTemplate,
  QueryTask,
  Search,
  Color,
  SimpleMarkerSymbol,
  SimpleLineSymbol
) {
  map = new Map("mapDiv", {
    basemap: "streets",
    zoom: 3,
    center: [-114, 25],
  });

  let usaCountiesUrl =
    "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services/cb_2017_us_county_500k_v2/FeatureServer/0";

  let worldCountriesUrl =
    "http://localhost:6080/arcgis/rest/services/WorldDataFolder/World_Countries/MapServer";

  let airportURL =
    "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services/airports/FeatureServer/0";

  let usaCountriesLayer = new FeatureLayer(usaCountiesUrl, {
    outFields: ["*"],
  });
  let airportLayer = new FeatureLayer(airportURL, {
    outFields: ["*"],
    definitionExpression:
      "iso_country='US' and continent='NA' and type='small_airport'",
  });
  let worldLayer = new ArcGISDynamicMapServiceLayer(worldCountriesUrl, {
    id: "worldCounteries",
  });

  map.addLayers([worldLayer, usaCountriesLayer, airportLayer]);
  function showResults(e) {
    console.log(e);
  }

  // ///using find task to search for string text in attributes
  // document.getElementById("search-btn").addEventListener("click", () => {
  //   var find = new FindTask(worldCountriesUrl);
  //   var params = new FindParameters();
  //   params.returnGeometry = true;
  //   params.contains = true;
  //   params.layerIds = [0];
  //   params.searchFields = ["CNTRY_NAME", "LONG_NAME"];
  //   params.searchText = dom.byId("searchText").value;
  //   find.execute(params, showResults, (e) => console.log(e));
  // });

  // //using Identify task
  // map.on("click", executeIdentifyTask);
  // function executeIdentifyTask(e) {
  //   let identifyTask = new IdentifyTask(worldCountriesUrl);
  //   let identifyParams = new IdentifyParameters();
  //   var pointMap = e.mapPoint;
  //   identifyParams.geometry = e.mapPoint;
  //   identifyParams.mapExtent = map.extent;
  //   identifyParams.width = map.width;
  //   identifyParams.height = map.height;

  //   identifyParams.layerIds = [0];
  //   identifyParams.returnFieldName = true;
  //   identifyParams.returnGeometry = true;
  //   identifyParams.tolerance = 2;
  //   identifyTask.execute(
  //     identifyParams,
  //     (e) => {
  //       let features = e.map((e) => e.feature);
  //       for (let i = 0; i < features.length; i++) {
  //         const feat = features[i];
  //         console.log(feat);
  //         let layerName = feat.layerName;
  //         feat.attributes.layerName = layerName;
  //         var infoTemplate = new InfoTemplate(
  //           "",
  //           "${CNTRY_NAME} <br/> area in m2: ${SQMI} </br> population: ${POP2006}"
  //         );
  //         feat.setInfoTemplate(infoTemplate);
  //         map.infoWindow.setFeatures([feat]);
  //         map.infoWindow.show(pointMap);
  //       }
  //     },
  //     (err) => {
  //       console.log(err);
  //     }
  //   );
  // }

  ///using query task for search by buffer
  //3- Search Widget
  var s = new Search(
    {
      sources: [
        {
          featureLayer: usaCountriesLayer,
          searchFields: ["NAME"],
          suggestionTemplate: "${NAME}",
          exactMatch: false,
          outFields: ["*"],
          name: "USA County Name",
          placeholder: "Please Enter Specific USA County name...",
          maxResults: 6,
          maxSuggestions: 6, //no of places shown in search
          enableSuggestions: true,
          minCharacters: 0,
          localSearchOptions: { distance: 5000 },
          showInfoWindowOnSelect: false, //false to diactivate showing popup after zooming to the searched place
          enableHighlight: true, //false to disable the highlight symbology on the searched place
        },
      ],
      map: map,
      enableButtonMode: true,
      expanded: false,
      zoomScale: 2311162,
      enableSearchingAll: false, //false to diactivate the search encoding
      // labelSymbol: "",
      // showInfoWindowOnSelect: false,
    },
    "search"
  );
  s.startup();

  s.on("select-result", (e) => {
    map.graphics.clear();
    let feature = e.result.feature;
    s.focus();
    // s.clear(); //to clear the searched value from search text box
    map.infoWindow.setFeatures([feature]);
    let query = new Query();
    let queryTask = new QueryTask(airportURL);
    query.geometry = feature.geometry;
    // query.distance = 5;
    // query.units = "kilometers";
    query.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
    query.returnGeometry = true;
    query.outFields = ["*"];
    queryTask.execute(
      query,
      (e) => {
        let airportFeats = e.features;
        // map.infoWindow.setFeatures(airportFeats);
        airportFeats.forEach((feat) => {
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
          console.log(feat);
          map.graphics.add(feat);
        });
      },
      (err) => console.log(err)
    );
  });
  map.on("click", () => {
    if (document.getElementsByClassName("searchInput")[0].value !== "")
      s.clear();
  });
});
