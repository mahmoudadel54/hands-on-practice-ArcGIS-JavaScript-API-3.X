var map;
//dojo/domReady! -- > its functionality jsut to make sure that website is ready to go
//before we load up our code  ---> it ,must be the last item in require array
require([
  "esri/map",
  "esri/dijit/Scalebar",
  "esri/basemaps",
  "dojo/on",
  "esri/layers/FeatureLayer",
  "esri/dijit/PopupTemplate",
  "esri/InfoTemplate",
  "esri/dijit/BasemapGallery",
  "esri/dijit/BasemapToggle",
  "esri/dijit/Search",
  "esri/dijit/HomeButton",
  "esri/dijit/LayerList",
  "esri/dijit/Legend",
  "esri/dijit/LocateButton",
  "esri/dijit/Measurement",
  "esri/units",
  "dojo/dom",
  "esri/dijit/Gauge",
  "esri/dijit/FeatureTable",
  "dojo/domReady!",
], function (
  Map,
  Scalebar,
  esriBasemaps,
  on,
  FeatureLayer,
  PopupTemplate,
  InfoTemplate,
  BasemapGallery,
  BasemapToggle,
  Search,
  HomeButton,
  LayerList,
  Legend,
  LocateButton,
  Measurement,
  Units,
  dom,
  Gauge,
  FeatureTable
) {
  //if I want to create my base map
  esriBasemaps.myBaseMap = {
    baseMapLayers: [
      {
        url:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
      },
    ],
    title: "myBaseMap",
  };
  map = new Map("map", {
    //use my basemap
    // basemap: "myBaseMap",
    basemap: "satellite",
    // center: [31, 25.75],
    center: [-110.4, 48.08],
    zoom: 3,
    // nav: true,       //show arrow buttons to go up-down-left-right on map
    sliderPosition: "bottom-right",
  });
  var scalebar = new Scalebar({
    map: map,
    scalebarUnit: "dual",
  });
  /** Start Popup */
  //add pop functionality --> Via 1- InfoTemplate or PopupTemplate
  /*
  1-
  InfoTemplate -- > add it as a property to layer
  InfoTemplate -> takes title, content
  **very important difference bet. popupTemplate, infotemplate is 
  for infoTemplate --> we should write like this ${field} or ${*} if we want to diplay all fields
  for popupTemplate --> we can write field refernce like this {field} directly
  https://developers.arcgis.com/javascript/3/jsapi/infotemplate-amd.html

  */
  let infoTemplate = new InfoTemplate({
    title: "USA State ${STATE_NAME}",
    content: "${*}",
  });

  /*
  2- 
  PopupTemplate -- > add it as a property to layer 
  PopupTemplate take title, description and many other props
  https://developers.arcgis.com/javascript/3/jsapi/popuptemplate-amd.html
  */
  let popTemplate = new PopupTemplate({
    title: "USA State {STATE_NAME} Info",
    description:
      "<h5>{STATE_NAME}</h5><br></br><strong>Its Area: {SQMI}</strong> ",
  });
  /**End Popup  */
  /******************************************************************************** */

  //rest API url of a layer from server
  let airposrtURL =
    "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services/airports/FeatureServer/0";
  let usaStateURL =
    "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services/US_States/FeatureServer/0";
  let crunchbaseTopUrbanAreasUrl =
    "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services/Crunchbase_TopUrbanAreas/FeatureServer/0";
  let crunchbaseTopUrbanAreasLayer = new FeatureLayer(
    crunchbaseTopUrbanAreasUrl,
    {
      infoTemplate: infoTemplate, //here infoTemplate property can take InfoTemplate or PopupTemplate
      outFields: ["*"],
    }
  );
  let layer = new FeatureLayer(usaStateURL, {
    infoTemplate: infoTemplate, //here infoTemplate property can take InfoTemplate or PopupTemplate
    outFields: ["*"],
  });
  let airposrtLayer = new FeatureLayer(airposrtURL, {
    infoTemplate: infoTemplate, //here infoTemplate property can take InfoTemplate or PopupTemplate
    outFields: ["*"],
    definitionExpression:
      "iso_country='US' and type='heliport' and iso_region='US-FL'",
  });
  map.addLayer(layer);
  map.addLayer(crunchbaseTopUrbanAreasLayer);
  map.addLayer(airposrtLayer);

  /** Start Adding Widgets to map */
  //1- BaseMapGallery Widget
  let basemapGalleryWidget = new BasemapGallery(
    {
      map: map,
      showArcGISBasemaps: true,
      //   basemaps: ["streets", "topo", "satellite", "osm"],
    },
    "basemapGalleryDiv" //the dom element that will added there, developer must handle its CSS to display on map
  );
  //Finalizes the creation of the  widget. Call startup() after creating
  //the widget when you are ready for user interaction.

  basemapGalleryWidget.startup();
  //2- BasemapToggle widget
  let basemapToggleWidget = new BasemapToggle(
    {
      map: map,
      basemap: "dark-gray",
    },
    "BasemapToggle" //the dom element that will added there, developer must handle its CSS to display on map
  );
  //Finalizes the creation of the  widget. Call startup() after creating
  //the widget when you are ready for user interaction.

  basemapToggleWidget.startup();

  //3- Search Widget
  var s = new Search(
    {
      sources: [
        {
          featureLayer: layer,
          searchFields: ["STATE_NAME"],
          suggestionTemplate: "${STATE_NAME}",
          exactMatch: false,
          outFields: ["*"],
          name: "USA State Name",
          placeholder: "Please Enter Specific USA State name...",
          maxResults: 6,
          maxSuggestions: 6, //no of places shown in search
          enableSuggestions: true,
          minCharacters: 0,
          localSearchOptions: { distance: 5000 },
          showInfoWindowOnSelect: false, //false to diactivate showing popup after zooming to the searched place
          enableHighlight: false, //false to disable the highlight symbology on the searched place
        },
      ],
      map: map,
      enableButtonMode: true,
      expanded: false,
      enableSearchingAll: false, //false to diactivate the search encoding
      // labelSymbol: "",
      // showInfoWindowOnSelect: false,
    },
    "search"
  );
  s.startup();

  on(s, "select-result", (e) => {
    console.log(e);
    s.focus();
    // s.clear();  //to clear the searched value from search text box
  });
  /** End Adding Widgets to map */

  /* Home Button */
  var home = new HomeButton(
    {
      map: map,
    },
    "HomeButton"
  );
  home.startup();
  /*End Home Button*/

  /* Layer list widget */
  var layersListWidget = new LayerList(
    {
      map: map,
      layers: [
        {
          layer: layer, // required unless featureCollection.
          // featureCollection: featureCollection, // required unless layerObject. If the layer is a feature collection, should match AGOL feature collection response and not have a layerObject.
          showSubLayers: true, // optional, show sublayers for this layer. Defaults to the widget's 'showSubLayers' property.
          showLegend: true, // optional, display a legend for the layer items.
          // content: <domNode>, // optional, custom node to insert content. It appears below the title.
          // showOpacitySlider: true, // optional, display the opacity slider for layer items.
          // button: <domNode>, // optional, custom button node that will appear within the layer title.
          visibility: true, // optionally set the default visibility
          id: "USA States", // optionally set the layer's id
        },
        {
          // featureCollection: featureCollection, // required unless layerObject. If the layer is a feature collection, should match AGOL feature collection response and not have a layerObject.
          layer: airposrtLayer, // required unless featureCollection.
          showSubLayers: true, // optional, show sublayers for this layer. Defaults to the widget's 'showSubLayers' property.
          showLegend: true, // optional, display a legend for the layer items.
          // content: <domNode>, // optional, custom node to insert content. It appears below the title.
          // showOpacitySlider: true, // optional, display the opacity slider for layer items.
          // button: <domNode>, // optional, custom button node that will appear within the layer title.
          visibility: true, // optionally set the default visibility
          id: "USA Oil Locations", // optionally set the layer's id
        },
        {
          // featureCollection: featureCollection, // required unless layerObject. If the layer is a feature collection, should match AGOL feature collection response and not have a layerObject.
          layer: crunchbaseTopUrbanAreasLayer, // required unless featureCollection.
          showSubLayers: true, // optional, show sublayers for this layer. Defaults to the widget's 'showSubLayers' property.
          showLegend: true, // optional, display a legend for the layer items.
          // content: <domNode>, // optional, custom node to insert content. It appears below the title.
          // showOpacitySlider: true, // optional, display the opacity slider for layer items.
          // button: <domNode>, // optional, custom button node that will appear within the layer title.
          visibility: true, // optionally set the default visibility
          id: "Top Urban Areas in USA", // optionally set the layer's id
        },
      ],
      showLegend: true,
      // showOpacitySlider: true,
      showSubLayers: true,
      visible: true,
    },
    "layerList"
  );
  layersListWidget.startup();
  /** End Layer list widget */

  /** Start Legend Widget */
  let legendWidget = new Legend(
    {
      map: map,
      layerInfos: [
        {
          layer: layer,
          title: "US States",
        },
        {
          layer: crunchbaseTopUrbanAreasLayer,
          title: "Top USA Urban Areas",
        },
      ],
    },
    "legend"
  );
  legendWidget.startup();
  /** End Legend Widget */

  /** Start GeoLocation Button */
  let geoLocationBtn = new LocateButton(
    {
      map: map,
      scale: 4622324,
    },
    "geolocation"
  );
  geoLocationBtn.startup();
  /** End GeoLocation Button */

  /*Start Measurement Widget */
  let measurementWidget = new Measurement(
    {
      map: map,
      defaultAreaUnit: Units.SQUARE_MILES,
      defaultLengthUnit: Units.KILOMETERS,
    },
    dom.byId("measurement")
  );
  measurementWidget.startup();
  /** End  Measurement Widget*/

  /** Start Gauge Widget */
  // var gaugeParams = {
  //   caption: "Urban Areas Populations",
  //   color: "#c0c",
  //   dataField: "NumStartups",
  //   dataFormat: "value",
  //   dataLabelField: "NumStartups",
  //   layer: crunchbaseTopUrbanAreasLayer,
  //   maxDataValue: 2000,
  //   noFeatureLabel: "NumStartups",
  //   title: "Urban Areas Populations",
  //   unitLabel: " Person",
  // };
  // var gauge = new Gauge(gaugeParams, "gaugeDiv");
  // gauge.startup();
  /**End Gauge Widget */

  /** Start Feature Table */
  let featTable = new FeatureTable(
    {
      featureLayer: layer,
      outFields: ["*"],
      // fieldInfos: ["*"],
      showStatistics: true,
      showFeatureCount: true,
      map: map,
      zoomToSelection: true,
      syncSelection: true,
    },
    "feat-table"
  );
  featTable.startup();
  /** End Feature Table */

  //to goto extent of layer
  // crunchbaseTopUrbanAreasLayer.on("load", (e) => {
  // console.log(e);
  // map.setExtent(e.target.fullExtent);
  // });

  //event handler for map
  //   map.on("click", (e) => console.log(e));
  //== like this
  //   on(map, "click", (e) => console.log(e));
});

/*Related to legend Widget*/
var legendWidget;
var legendBtn = document.querySelector(".show-legend-btn");

legendBtn.addEventListener("click", (e) => {
  legendWidget = document.getElementById("legend");
  if (legendWidget.classList.contains("legend-active")) {
    legendWidget.classList.remove("legend-active");
  } else legendWidget.classList.add("legend-active");
});

/** End  */
/*Related to measurement Widget*/
var measureWidget;
var measureBtn = document.querySelector(".show-measurement-btn");

measureBtn.addEventListener("click", (e) => {
  measureWidget = document.getElementsByClassName("esriMeasurement")[0];
  if (measureWidget.classList.contains("measurement-active")) {
    measureWidget.classList.remove("measurement-active");
    measureBtn.classList.remove("active");
  } else {
    measureWidget.classList.add("measurement-active");
    measureBtn.classList.add("active");
  }
});

/** End  */

/*Related to feature table*/
var featTableElement;
var featTableShowBtn = document.querySelector(".show-table-btn");

featTableShowBtn.addEventListener("click", (e) => {
  featTableElement = document.getElementById("feat-table");
  if (featTableElement.classList.contains("feat-table-active")) {
    featTableElement.classList.remove("feat-table-active");
    featTableShowBtn.classList.remove("active");
  } else {
    featTableElement.classList.add("feat-table-active");
    featTableShowBtn.classList.add("active");
    // document.body.scrollTop = 1000; // For Safari
    // document.documentElement.scrollTop = 1000; // For Chrome, Firefox, IE and Opera
  }
});

/** End  */
