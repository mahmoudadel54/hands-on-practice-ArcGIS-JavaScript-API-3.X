require([
  "esri/map",
  "esri/layers/FeatureLayer",
  "esri/tasks/query",
  "esri/tasks/StatisticDefinition",
  "esri/geometry/geometryEngine",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/graphic",
  "esri/Color",
  "dojo/dom",
  "esri/tasks/QueryTask",

  "dojo/domReady!",
], function (
  Map,
  FeatureLayer,
  Query,
  StatisticDefinition,
  geometryEngine,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  SimpleFillSymbol,
  Graphic,
  Color,
  dom,
  QueryTask
) {
  var map = new Map("map", {
    basemap: "streets-night-vector",
    zoom: 3,
    center: [-114, 25],
  });

  var url =
    "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services/airports/FeatureServer/0";

  /******************************************************************
   *
   * The fields used to query for statistics
   * elevation_ft  is the elevation level of airport in feet above sea level
   * avg_Elev_Ht is Average of elevation level of airport in feet above sea level
   *
   *******************************************************************/

  var fields = [
    "name",
    "type",
    "elevation_ft",
    "continent",
    "scheduled_service",
    "home_link",
  ];

  var airportsLyr = new FeatureLayer(url, {
    outFields: fields,
  });

  // Symbol used to represent point clicked on map
  var pointSymbol = new SimpleMarkerSymbol(
    SimpleMarkerSymbol.STYLE_CIRCLE,
    10,
    new SimpleLineSymbol(
      SimpleLineSymbol.STYLE_SOLID,
      new Color([0, 255, 0, 0.3]),
      10
    ),
    new Color([0, 255, 0, 1])
  );

  // Symbol used to represent one-mile buffer around point
  var buffSymbol = new SimpleFillSymbol(
    SimpleFillSymbol.STYLE_SOLID,
    new SimpleLineSymbol(
      SimpleLineSymbol.STYLE_LONGDASHDOT,
      new Color([255, 128, 0, 1]),
      3
    ),
    new Color([255, 128, 0, 0.15])
  );

  // When the map is clicked, get the point at the clicked location and execute getPoint()
  map.on("click", getPoint);

  /******************************************************************
   *
   * The sqlExpression is a standard SQL expression that will be used to
   * query the service for statistics.
   * This expression is then set on the onStatisticField property of each
   * statistic definition object. Since we don't have a field for population
   * density in people per square mile, we can use this simple SQL expression
   * in the place of a field and we'll get our desired result:
   *
   * ""
   *
   *******************************************************************/

  var sqlExpression = "elevation_ft";

  // Object used to request the smallest population density from the
  // block groups within one mile of the mouse click.
  var minStatDef = new StatisticDefinition();
  minStatDef.statisticType = "min";
  minStatDef.onStatisticField = sqlExpression;
  minStatDef.outStatisticFieldName = "minPopDensity";

  // Object used to request the largest population density from the
  // block groups within one mile of the mouse click.
  var maxStatDef = new StatisticDefinition();
  maxStatDef.statisticType = "max";
  maxStatDef.onStatisticField = sqlExpression;
  maxStatDef.outStatisticFieldName = "maxPopDensity";

  // Object used to request the average population density for
  // all block groups within one mile of the mouse click.
  var avgStatDef = new StatisticDefinition();
  avgStatDef.statisticType = "avg";
  avgStatDef.onStatisticField = sqlExpression;
  avgStatDef.outStatisticFieldName = "avgPopDensity";

  // Object used to request the number of
  // block groups within one mile of the mouse click.
  var countStatDef = new StatisticDefinition();
  countStatDef.statisticType = "count";
  countStatDef.onStatisticField = sqlExpression;
  countStatDef.outStatisticFieldName = "numairports";

  // Object used to request the standard deviation of the population density for
  // all block groups within one mile of the mouse click.
  var stddevStatDef = new StatisticDefinition();
  stddevStatDef.statisticType = "stddev";
  stddevStatDef.onStatisticField = sqlExpression;
  stddevStatDef.outStatisticFieldName = "StdDevPopDensity";

  // Set the base parameters for the query. All statistic definition objects
  // are passed as an array into the outStatistics param
  var queryParams = new Query();
  queryParams.distance = 30; // Return all block groups within one mile of the point
  queryParams.units = "miles";
  queryParams.outFields = fields;
  queryParams.outStatistics = [
    minStatDef,
    maxStatDef,
    avgStatDef,
    countStatDef,
    stddevStatDef,
  ];

  // Executes on each map click
  function getPoint(evt) {
    // Set the location of the mouse click event to the query parameters
    var point = evt.mapPoint;
    queryParams.geometry = point;

    // Clear the graphics from any previous queries
    map.graphics.clear();

    // Add a point graphic represting the location clicked on the map
    var ptGraphic = new Graphic(point, pointSymbol);
    map.graphics.add(ptGraphic);

    // Add a graphic representing a one-mile buffer around the clicked point
    var buffer = geometryEngine.geodesicBuffer(point, 30, "miles");
    var bufferGraphic = new Graphic(buffer, buffSymbol);
    map.graphics.add(bufferGraphic);

    // Execute the statistics query against the feature service and call the getStats() callback
    airportsLyr.queryFeatures(queryParams, getStats, errback);
    let qtAirports = new QueryTask(url);
    let qAirportForVisualise = new Query();
    qAirportForVisualise.returnGeometry = true;
    qAirportForVisualise.outFields = fields;
    qAirportForVisualise.distance = 30; // Return all block groups within one mile of the point
    qAirportForVisualise.units = "miles";
    qAirportForVisualise.geometry = point;
    qtAirports.execute(qAirportForVisualise, showResults, (err) =>
      console.log(err)
    );
  }
  function showResults(results) {
    let airportFeats = results.features;
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
      map.graphics.add(feat);
    });
  }

  // Executes on each query
  function getStats(results) {
    // The return object of the query containing the statistics requested
    var stats = results.features[0].attributes;
    // Print the statistic results to the DOM
    dom.byId("countResult").innerHTML = Math.round(stats.numairports);
    dom.byId("minResult").innerHTML =
      Math.round(stats.minPopDensity) + " airport";
    dom.byId("maxResult").innerHTML =
      Math.round(stats.maxPopDensity) + " airport";
    dom.byId("avgResult").innerHTML =
      Math.round(stats.avgPopDensity) + " airport";
    dom.byId("stdDevResult").innerHTML =
      Math.round(stats.StdDevPopDensity) + " airport";
  }

  function errback(err) {
    console.log("Couldn't retrieve summary statistics. ", err);
  }
});
