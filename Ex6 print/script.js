var map, updateFeature, editToolbar;
require([
  "esri/map",
  "esri/layers/FeatureLayer",
  "esri/tasks/query",
  "esri/tasks/PrintTemplate",
  "esri/dijit/Print",
  "esri/tasks/PrintTask",
  "esri/tasks/PrintParameters",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/tasks/LegendLayer",
  "dojo/dom",
  "dojo/domReady!",
], function (
  Map,
  FeatureLayer,
  Query,
  PrintTemplate,
  Print,
  PrintTask,
  PrintParameters,
  ArcGISDynamicMapServiceLayer,
  LegendLayer,
  dom
) {
  map = new Map("mapDiv", {
    basemap: "streets",
    zoom: 3,
  });

  let layerURL =
    "http://localhost:6080/arcgis/rest/services/WorldDataFolder/World_Countries/MapServer";

  let usaCountiesUrl =
    "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services/2010_us_counties/FeatureServer/0";
  let editableLayerUrl =
    "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/NCAA_Tourney_2015/FeatureServer/1";

  let editableLayer = new FeatureLayer(editableLayerUrl, {
    outFields: ["*"],
    allowUpdateWithoutMValues: true,
    allowGeometryUpdates: true,
  });
  let usaCountiesLayer = new FeatureLayer(usaCountiesUrl, {
    outFields: ["*"],
    supportsAdvancedQueries: true,
    mode: FeatureLayer.MODE_ONDEMAND,
  });
  let featLayer = new ArcGISDynamicMapServiceLayer(layerURL, {
    opacity: 0.75,
    id: "WorldCountries",
    // definitionExpression: "continent='EU' and type='heliport'",
    // mode: FeatureLayer.MODE_ONDEMAND,
    // supportsAdvancedQueries: true,
    // outFields: ["*"],
  });
  map.addLayers([featLayer]);

  map.on("layers-add-result", () => {
    var printTemplate;
    var legendLayer = new LegendLayer({
      layerId: "WorldCountries",
      subLayerIds: [0],
    });
    var printTemplate = {
      //Define the layout template options used by the PrintTask and Print widget to generate the print page.
      exportOptions: {
        width: 500,
        height: 400,
        dpi: 96,
      },
      label: "World Countries",
      layoutOptions: {
        titleText: "Map Title: World Countries",
        authorText: "Author: Mahmoud Adel",
        copyrightText: "Company: Asyad Company",
        scalebarUnit: "Miles",
      },
      customTextElements: [
        {
          TeamLeader: "Ahmed Abbas",
        },
      ],
      // preserveScale: true,
      showAttribution: false,
      legendLayers: [legendLayer],
      showLabels: true,
      // legendOlegendLayers: [],
    };
    var templates = [
      {
        ...printTemplate,
        format: "pdf",
        layout: "MAP_ONLY",
        label: printTemplate.label + "Image only (PDF)",
      },
      {
        ...printTemplate,
        format: "jpg",
        layout: "MAP_ONLY",
        label: printTemplate.label + "Image only (jpg)",
      },
      {
        ...printTemplate,
        format: "png8",
        layout: "MAP_ONLY",
        label: printTemplate.label + "Image (png)",
      },
      {
        ...printTemplate,
        format: "png8",
        layout: "A3 Landscape",
        label: printTemplate.label + "A3 Landscape full layout (png)",
      },
      {
        ...printTemplate,
        format: "PDF",
        layout: "A3 Landscape",
        label: printTemplate.label + " A3 Landscape full layout (PDF)",
      },
    ];
    var printTaskUrl =
      "http://localhost:6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";
    var printer = new Print(
      {
        map: map,
        templates: templates,
        url: printTaskUrl,
      },
      dom.byId("print-button")
    );
    printer.startup();
  });
});
