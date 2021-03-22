var map;
require([
  "esri/map",
  "esri/basemaps",
  "esri/geometry/Point",
  "esri/SpatialReference",
  "esri/tasks/QueryTask",
  "esri/tasks/query",
  "esri/layers/GraphicsLayer",
  "esri/geometry/projection",
  "esri/graphic",
  "esri/symbols/SimpleFillSymbol",
  "esri/Color",
  "esri/toolbars/draw",
  "esri/InfoTemplate",
  "dojo/domReady!",
], function (
  Map,
  esriBasemaps,
  Point,
  SpatialReference,
  QueryTask,
  Query,
  GraphicsLayer,
  projection,
  Graphic,
  SimpleFillSymbol,
  Color,
  InfoTemplate
) {
  // load the projection module
  const projectionPromise = projection.load();
  //step 1: create a basemap that has different spatial ref here: its wkid = 54042 it is projected
  // add a dark gray basemap in winkel III projection
  esriBasemaps.winkel = {
    baseMapLayers: [
      {
        url:
          "https://arcgis1.storymaps.esri.com/arcgis/rest/services/basemaps/Esri_WinkelTripel_dark_gray/MapServer",
      },
    ],
    thumbnailUrl: "",
    title: "Winkel",
  };

  //create a center point for the basemap --> but it requires a spatial reference first:
  //step 2: create a spatial reference
  let basemapSR = new SpatialReference({
    wkid: 54042,
  });
  //step3: create a center point with the projected coordinate system
  let centerPoint = new Point({
    x: -137360.59506842494,
    y: 89471.9658671468,
    spatialReference: basemapSR,
  });
  //initialze map with the created basemap and center Point
  map = new Map("mapDiv", {
    scale: 100000000,
    center: centerPoint,
    basemap: "winkel",
  });
  //   map.on("load", function () {
  //step4: create graphic layer and add it to map
  let wifiGraphicLayer = new GraphicsLayer();
  map.addLayer(wifiGraphicLayer);

  // ***projection must be loaded first before convert projection
  projectionPromise.then(() => {
    //step 5: fetch the data that will be visualized
    let dataUrl =
      "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services/US_States/FeatureServer/0";
    let query = new Query();
    let queryTask = new QueryTask(dataUrl);
    query.where = "1=1";
    query.outSpatialReference = { wkid: 3857 };
    query.returnGeometry = true;
    query.outFields = ["*"];
    queryTask.execute(
      query,
      (e) => {
        let features = e.features;
        features.forEach((feat) => {
          //step 6: create a point from fetched features
          const point = new Point(feat.geometry);
          //step7 the conversion: project the point from 3857 to winkel III projection (basemap projection)
          //this step requires esri/geometry/projection module
          const projectedPoint = projection.project(point, basemapSR);
          const attributes = feat.attributes;
          // //step8: create graphic --> it requires "esri/graphic"
          var usaStateSymbol = new SimpleFillSymbol()
            .setStyle(SimpleFillSymbol.STYLE_SOLID)
            .setColor(new Color([255, 0, 0, 0.5]));
          const graphic = new Graphic(
            projectedPoint,
            usaStateSymbol,
            attributes
          );

          wifiGraphicLayer.add(graphic);
        });
      },
      (err) => {
        console.log("error happened while projecting", err);
      }
    );
  });
  //   });
  map.on("click", (e) => console.log(e.mapPoint));
});
