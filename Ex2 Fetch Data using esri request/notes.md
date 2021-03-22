# Default API Configurations
## 1 - Change default symbology of points, lines, polygons
### ---> esri.config.defaults.map.zoomSymbol
#### One common change is to modify the symbol used for the map's zoom box. In the code below, a new symbol is created, converted to a JSON object and then set as the map's default zoom symbol.

For Ex.
require([
  "esri/config",
  "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "dojo/_base/Color"
], function(
  esriConfig,
  SimpleFillSymbol, SimpleLineSymbol, Color
) {
  var lineColor = new Color([0,0,255]);
  var fillColor = new Color([255,255,0,0.5]);
  var zoomSymbol = new SimpleFillSymbol(
    SimpleFillSymbol.STYLE_SOLID,
    new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, lineColor, 2),
    fillColor
  );
  esriConfig.defaults.map.zoomSymbol = zoomSymbol.toJson();
});


## 2- geometryService :
#### Represents a geometry service resource exposed by the ArcGIS Server REST API. 
#### It is used to perform various operations on geometries such as project, simplify, buffer, and relationships.
#### ---> esri.config.defaults.map.zoomSymbol
