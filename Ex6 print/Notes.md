### Printing Map

##### there are 2 ways to print:

##### 1 - Using Print Widget --> "esri/dijit/Print"

##### it needs URL from ArcGIS server for export web map task like this : http://localhost:6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task

##### You should create PrintTemplate that includes the exportOptions like width, height + print format + print layout and so on ...

##### 2- Using PrintTask ---> "esri/tasks/PrintTask" it takes url of the export web map task URL from ArcGIS Server and then use excute the task and pass printParameters to the excute method -> https://developers.arcgis.com/javascript/3/jsapi/printparameters-amd.html
