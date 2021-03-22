var map;
var toolbar;
require([
  "esri/map",
  "esri/toolbars/draw",
  "esri/graphic",

  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",

  "dojo/domReady!",
], function (
  Map,
  Draw,
  Graphic,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  SimpleFillSymbol
) {
  map = new Map("mapDiv", {
    basemap: "streets",
    zoom: 3,
  });
  map.on("load", createDrawToolBar);
  function createDrawToolBar() {
    toolbar = new Draw(map);
    toolbar.on("draw-end", addToMap);
  }
  var drawBtns = document.getElementsByClassName("draw-btns");
  let htmlCollection = Array.from(drawBtns[0].children);
  console.log(htmlCollection);
  htmlCollection.map((btn) => {
    btn.addEventListener("click", (e) => {
      let type = e.target.dataset.type;
      console.log(type);
      toolbar.activate(Draw[type]);
      map.hideZoomSlider();
    });
  });

  function addToMap(evt) {
    console.log(evt);
    var symbol;
    toolbar.deactivate(); //Deactivates the toolbar and reactivates map navigation.
    map.showZoomSlider();
    switch (evt.geometry.type) {
      case "point":
      case "multipoint":
        symbol = new SimpleMarkerSymbol();
        break;
      case "polyline":
        symbol = new SimpleLineSymbol();
        break;
      default:
        symbol = new SimpleFillSymbol();
        break;
    }
    var graphic = new Graphic(evt.geometry, symbol);
    map.graphics.add(graphic);
  }
});
