var map, updateFeature, editToolbar;
require([
  "esri/map",
  "esri/toolbars/edit",
  "esri/layers/FeatureLayer",
  "esri/dijit/editing/TemplatePicker",
  "esri/dijit/AttributeInspector",
  "esri/tasks/query",
  "dojo/dom-construct",

  "dojo/domReady!",
], function (
  Map,
  Edit,
  FeatureLayer,
  TemplatePicker,
  AttributeInspector,
  Query,
  domConstruct
) {
  map = new Map("mapDiv", {
    basemap: "dark-gray",
    center: [-105.4, 40.08],
    zoom: 5,
  });

  let layerURL =
    "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services/airports/FeatureServer/0";

  let usaCountiesUrl =
    "https://services.arcgis.com/q7zPNeKmTWeh7Aor/ArcGIS/rest/services/cb_2017_us_county_500k_v2/FeatureServer/0";
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
    allowUpdateWithoutMValues: true,
    allowGeometryUpdates: true,
    // mode: FeatureLayer.MODE_ONDEMAND,
  });
  let featLayer = new FeatureLayer(layerURL, {
    definitionExpression: "continent='EU' and type='heliport'",
    mode: FeatureLayer.MODE_ONDEMAND,
    supportsAdvancedQueries: true,
    outFields: ["*"],
  });
  map.on("load", () => {
    map.addLayers([featLayer, usaCountiesLayer, editableLayer]);
    //Edit features
    editToolbar = new Edit(map);
    var editType;
    var editTypeBtns = Array.from(document.getElementsByClassName("edit-type"));
    console.log(editTypeBtns);
    editTypeBtns.forEach((e) => {
      e.addEventListener("click", (e) => {
        let element = e.target;

        if (element.classList.contains("active")) {
          element.classList.remove("active");
          usaCountiesLayer.disableMouseEvents();
          editToolbar.deactivate();
        } else {
          let activeElem = document.getElementsByClassName("active")[0];
          if (activeElem) activeElem.classList.remove("active");
          element.classList.add("active");
          editType = element.dataset.editType;
          activateEdit(editType);
        }
      });
    });
    editToolbar.on("deactivate", function (evt) {
      if (evt.info.isModified) {
        usaCountiesLayer.applyEdits(null, [evt.graphic], null);
      }
    });
    function activateEdit(type) {
      usaCountiesLayer.on("click", function (evt) {
        // activateToolbar(evt.graphic);
        console.log("Click on feat", evt);
        let options = {
          allowAddVertices: true,
          allowDeleteVertices: true,
        };
        let typeOfEdit =
          type === "MOVE"
            ? Edit.MOVE
            : type === "ROTATE"
            ? Edit.ROTATE
            : Edit.EDIT_VERTICES;
        console.log(typeOfEdit);
        editToolbar.activate(typeOfEdit, evt.graphic, options);
      });
    }
    // let templatePicker = new TemplatePicker(
    //   {
    //     featureLayers: [featLayer],
    //     style: "width:400px; height:200px;",
    //     useLegend: true,
    //     grouping: true,
    //   },
    //   "edit-template"
    // );
    // templatePicker.startup();

    //handle filter data from arcServer based on President field
    var selectElement = document.getElementById("president");
    var resetFilterPresident = document.getElementById(
      "reset-filter-president"
    );
    console.log(featLayer);
    console.log(selectElement.value);
    selectElement.addEventListener("change", (e) => {
      console.log(e.target.value);
      if (e.target.value != 0)
        featLayer.setDefinitionExpression(
          `continent='EU' and type='heliport' and iso_country='${e.target.value}'`
        );
    });
    resetFilterPresident.addEventListener("click", (e) => {
      featLayer.setDefinitionExpression("continent='EU' and type='heliport'");
      selectElement.value = "0";
    });
  });

  map.on("layer-add-result", (evt) => {
    var selectQuery = new Query();
    map.on("click", function (evt) {
      console.log("Layer is editable? ", editableLayer.isEditable());
      selectQuery.geometry = evt.mapPoint;
      selectQuery.distance = 50;
      selectQuery.units = "miles";
      selectQuery.returnGeometry = true;
      editableLayer.selectFeatures(
        selectQuery,
        FeatureLayer.SELECTION_NEW,
        function (features) {
          if (features.length > 0) {
            console.log(545454);
            //store the current feature
            updateFeature = features[0];
            console.log(map.getInfoWindowAnchor(evt.screenPoint));
            map.infoWindow.setTitle(features[0].getLayer().name);
            map.infoWindow.show(
              evt.screenPoint,
              map.getInfoWindowAnchor(evt.screenPoint)
            );
          } else {
            map.infoWindow.hide();
          }
        }
      );

      map.infoWindow.on("hide", function () {
        editableLayer.clearSelection();
      });
      var layerInfos = [
        {
          featureLayer: editableLayer,
          showAttachments: false,
          isEditable: true,
          showDeleteButton: true,
          fieldInfos: [
            // {'fieldName': 'University', 'isEditable': false, 'label': 'School:'},
            {
              fieldName: "WINPER",
              isEditable: true,
              tooltip: "Win percentage",
              label: "Win percentage:",
            },
            {
              fieldName: "Rd_64_Venue",
              isEditable: false,
              label: "Rd 1 Venue:",
            },
            {
              fieldName: "Rd_64_Result",
              isEditable: true,
              tooltip: "First round result (W/L)",
              label: "Rd 1 Result:",
            },
            {
              fieldName: "Rd_64_Margin",
              isEditable: true,
              tooltip: "First round margin of victory/loss",
              label: "Rd 1 Margin:",
            },
          ],
        },
      ];
      //Initialize Attribute Inspector
      let popupDiv = document.createElement("div");
      popupDiv.setAttribute("id", "popup");
      let saveBtn = document.createElement("button");
      saveBtn.setAttribute("label", "Save");
      saveBtn.setAttribute("class", "saveButton");
      saveBtn.innerText = "Save";
      popupDiv.appendChild(saveBtn);

      var attInspector = new AttributeInspector(
        {
          layerInfos: layerInfos,
        },
        popupDiv
      );
      attInspector.startup();

      map.infoWindow.setContent(attInspector.domNode);
      map.infoWindow.resize(350, 240);
      attInspector.on("attribute-change", function (evt) {
        //store the updates to apply when the save button is clicked
        updateFeature.attributes[evt.fieldName] = evt.fieldValue;
      });
    });
  });
});
