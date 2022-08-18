/*-------- Map visualization --------*/
var map = L.map('map', {
   // maxBounds: [
   //     //south west
   //     [36.036483, -5.556870],
   //     //north east
   //     [36.192343, -5.395024]
   // ],
   maxZoom: 16,
   minZoom: 10,
   // layers: [googleStreets, cities]
}).setView([36.113,-5.46], 13);

var osmMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
   maxZoom: 19,
   attribution: '© OpenStreetMap'
});

var lightMap = L.tileLayer('https://{s}.tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token=g0HVAdJ6WgjF09JkYudWLpbX8pIv5RMfeMVJ0joqeVS7uj0qvXir3BTx8yrSnIXr', {
   attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
   minZoom: 0,
   maxZoom: 22,
   subdomains: 'abcd',
}).addTo(map);

var darkMap = L.tileLayer('https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=g0HVAdJ6WgjF09JkYudWLpbX8pIv5RMfeMVJ0joqeVS7uj0qvXir3BTx8yrSnIXr', {
   attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
   minZoom: 0,
   maxZoom: 22,
   subdomains: 'abcd',
});

var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
   maxZoom: 20,
   subdomains:['mt0','mt1','mt2','mt3']
});

var googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
   maxZoom: 20,
   subdomains:['mt0','mt1','mt2','mt3']
});

// var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
//    maxZoom: 20,
//    subdomains:['mt0','mt1','mt2','mt3']
// });
//
// var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
//    maxZoom: 20,
//    subdomains:['mt0','mt1','mt2','mt3']
// });

var layer1 = L.layerGroup().addTo(map);
var layer2 = L.layerGroup();


var baseMaps = {
   "Open Street Maps": osmMap,
   "Google Streets": googleStreets,
   "Google Hybrid": googleHybrid,
   "Mapa Claro": lightMap,
   "Mapa Oscuro": darkMap,
   // "Google Satellite": googleSat,
   // "Google Terrain": googleTerrain
};

var geojson = L.geoJson(barrios, {
   style: style,
   onEachFeature: onEachFeature
}).addTo(map);

var geojson2 = L.geoJson(mallas, {
   style: style2,
   onEachFeature: onEachFeature2
});

var overlayMaps = {
   "Barrios": layer1, // an option to show or hide the layer you created from geojson
   "Mallas": layer2,
}

// toggle overlays:
// https://gis.stackexchange.com/questions/382017/leaflet-mutually-exclusive-overlay-layers-overlayadd-event-firing-twice

var layerControl = L.control.layers(baseMaps, overlayMaps,{position: "topleft", collapsed: false}).addTo(map);

collapseTimeout();
/*The layer control collapses automatically after timeout,
so the control doesnt stay open permanently
*/
function collapseTimeout() {
   setTimeout(function() {
      layerControl.remove();
      layerControl = L.control.layers(baseMaps, overlayMaps,{position: "topleft", collapsed: true}).addTo(map);

   },3000)
}

function removeWithTimeout(layer) {
   setTimeout(function() {
      map.removeLayer(layer);
   }, 10);
}


// Overlay layers are mutually exclusive
map.on('overlayadd', function(event) {
   //this allows the layercontrol to collapse after getting clicked
   layerControl.remove();
   layerControl = L.control.layers(baseMaps, overlayMaps,{position: "topleft", collapsed: true}).addTo(map);
   console.log("Clicked on " + event.name)
   if (event.name === "Mallas") {
      if (map.hasLayer(layer1)) {
         console.log("remove layer1");
         removeWithTimeout(layer1);
      }
   }
   else { //(event.name === "Barrios")
      if (map.hasLayer(layer2)) {
         console.log("remove layer2");
         removeWithTimeout(layer2);
      }
   }
});

map.on('baselayerchange', function() {
   //this allows the layercontrol to collapse after getting clicked
   setTimeout(function() {
      layerControl.remove();
      layerControl = L.control.layers(baseMaps, overlayMaps,{position: "topleft", collapsed: true}).addTo(map);
   }, 8000);
});

var barriosData = {}; //new Object()
var myLabelsLong = [];
var longLabelsActive = false;
barrios.features.forEach(loadData);
function loadData(item){
   let nombreBarrio = item.properties.barrio;
   myLabelsLong.push(nombreBarrio);
   barriosData[nombreBarrio] = item.properties;
}

/*-------- Map interaction --------*/
function highlightFeature(e) {
   let layer = e.target;
   layer.setStyle(stylelayer.highlight);

   if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
   }
   info.update(layer.feature.properties);
}

function resetHighlight(e) {
   let layer = e.target;
   layer.setStyle(stylelayer.default);
   info.update();
}

function showSpecDetails(e) {
   var layer = e.target;
   // map.fitBounds(e.target.getBounds());
   barrioSelected.update(layer.feature.properties);
}

function onEachFeature(feature, layer) {
   layer1.addLayer( layer );
   layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: showSpecDetails
   });
}

function onEachFeature2(feature, layer) {
   layer2.addLayer( layer );
   layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: showSpecDetails
   });
}

/*------------------------------ Sidebar ------------------------------*/
let iconLink1 = document.querySelectorAll(".icon_link1");
// let arrow1 = document.querySelectorAll(".arrowcat");
let iconLink2 = document.querySelectorAll(".icon_link2");
// let arrow2 = document.querySelectorAll(".arrowsub");
let sidebar = document.querySelector(".sidebar");
let menuButton = document.querySelector("#menubtn");
let dropTables1 = [];
let dropTables2 = [];
let zoomIcon = document.querySelector(".leaflet-left");
let layersIcon = document.querySelector(".leaflet-bottom.leaflet-left");

let k01_01 = document.querySelector("#k01_01").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k01_01","Superficie de Cobertura artificial (%)");
};
let k01_02 = document.querySelector("#k01_02").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k01_02","Superficie de Cultivos (%)");
};
let k01_03 = document.querySelector("#k01_03").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k01_03","Superficie de zonas húmedas (%)");
};
let k01_04 = document.querySelector("#k01_04").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k01_04","Superficie forestal (%)");
};
let k02_01 = document.querySelector("#k02_01").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k02_01","Superficie municipal destinada a explotaciones agrarias y forestales (%)");
};
let k02_02 = document.querySelector("#k02_02").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k02_02","Superficie municipal destinada a explotaciones agrarias y forestales respecto al suelo urbano y urbanizable delimitado de la ciudad (%)");
};
let k21_01 = document.querySelector("#k21_01").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k21_01","Índice de envejecimiento de la población (%)");
};
let k21_02 = document.querySelector("#k21_02").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k21_02","Índice de senectud de la población (%)");
};
let k22 = document.querySelector("#k22").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k22","Población extranjera (%)");
};
let k23_01 = document.querySelector("#k23_01").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k23_01","Índice de dependencia total (%)");
};
let k23_02 = document.querySelector("#k23_02").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k23_02","Índice de dependencia infantil (%)");
};
let k23_03 = document.querySelector("#k23_03").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k23_03","Índice de dependencia de mayores (%)");
};

setUpMenu1();
function setUpMenu1 () {
   for (let i = 0; i < iconLink1.length; i++) {
      iconLink1[i].addEventListener("click",(e)=>{
         // console.log(e.target.parentElement.parentElement.parentElement.classList.value);
         var element = e.target.parentElement.parentElement.parentElement;
         //this if is to solve the bug when "li" is clicked instead of clicking on "icon_link1"
         if (element.classList.value === "showmenu1" ||
            element.classList.value === "") {
            dropTables1[i] = element;
            // let dropTable = e.target.parentElement.parentElement.parentElement;
            dropTables1[i].classList.toggle("showmenu1");
         }

      })
   }
}


// for (let i = 0; i < arrow1.length; i++) {
//     arrow1[i].addEventListener("click",(e)=>{
//         dropTables1[i] = e.target.parentElement.parentElement;
//         // console.log("arrow: "+dropTables1[i]);
//         dropTables1[i].classList.toggle("showmenu1");
//     })
// }

for (let i = 0; i < iconLink2.length; i++) {
   iconLink2[i].addEventListener("click",(e)=>{
      dropTables2[i] = e.target.parentElement.parentElement.parentElement;
      // console.log(dropTable);
      dropTables2[i].classList.toggle("showmenu2");
   })
}

// for (let i = 0; i < arrow2.length; i++) {
//     arrow2[i].addEventListener("click",(e)=>{
//         dropTables2[i] = e.target.parentElement.parentElement;
//         // console.log(dropTable);
//         dropTables2[i].classList.toggle("showmenu2");
//     })
// }

//on mouse enter and leave, the sidebar expands and collapses
let sidebarStatic  = false;
function toggleSidebar() {
   if (!sidebarStatic) {
      console.log(sidebar.classList.value);
      sidebar.classList.toggle("active");
      zoomIcon.classList.toggle("active");
      layersIcon.classList.toggle("active");
      for (let i in dropTables1) {
         if (sidebar.classList.value === "sidebar" && dropTables1[i].classList.value === "showmenu1") {
            dropTables1[i].classList.toggle("showmenu1");
         }
      }
      for (let i in dropTables2) {
         if (sidebar.classList.value === "sidebar" && dropTables2[i].classList.value === "showmenu2") {
            dropTables2[i].classList.toggle("showmenu2");
         }
      }
   }
}

//when toggled, the sidebar doesnt expand and collapse on hover
menuButton.onclick = function() {
   sidebarStatic = !sidebarStatic;
}

/*-------- Charts --------*/
var myLabel = "";
var myLabels = [];
var myData = [];
var colorsChart = [];
graphingChart();
function graphingChart() {
   var info = L.control({position: 'bottomright'});
   info.onAdd = function (map) {
      var div = L.DomUtil.create('div','info charts');
      div.innerHTML += '<h4> Escala barrio </h4>';
      div.innerHTML += '<button id="chartbtn"> Mostrar nombres </button>'
      div.innerHTML += '<canvas id="myChart"></canvas>';
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);
      return div;

   }
   info.addTo(map);
}

var myChart = document.getElementById('myChart').getContext('2d'); //context 2d or 3d
// var canvas = document.getElementById('myChart');
// var parent = document.getElementById('info');

var dynamicChart = new Chart(myChart,{
   type: 'bar', //doughnut,pie,
   data: {
      labels: myLabels,
      datasets: [{
         // backgroundColor: colorsChart,
         backgroundColor: '#3d7685',
         label: "Dato",
         data: myData,
      }],
   },
   options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: {
         legend: {
            display: false,
         }
      }
   }
});

function addDataChart(chart, label, data) {
   for(let i in label) {
      chart.data.labels.push(label[i]);
   }
   for(let j in data) {
      chart.data.datasets.forEach((dataset) => {
         dataset.data.push(data[j]);
      });
   }
   chart.update();
}

function removeDataChart(chart) {
   while (chart.data.labels.length !== 0) {
      chart.data.labels.pop();
   }
   chart.data.datasets.forEach((dataset) => {
      while (dataset.data.length !== 0) {
         dataset.data.pop();
      }
   });
   chart.update();
}

let chartButton = document.querySelector("#chartbtn");
let chart1 = document.querySelector(".charts");

chartButton.onclick = function() {
   chart1.classList.toggle("active");
   showLongLabels();
}

function showLongLabels () {
   if (longLabelsActive) {
      removeDataChart(dynamicChart);
      addDataChart(dynamicChart, myLabels, myData);
   } else {
      removeDataChart(dynamicChart);
      addDataChart(dynamicChart, myLabelsLong, myData);
   }
   longLabelsActive = !longLabelsActive;
}
/*-------- Information panel --------*/
var barrioSelected = L.control({position: 'topright'});

barrioSelected.onAdd = function(map) {
   this._div = L.DomUtil.create('div', 'info details_scroller');
   L.DomEvent.disableClickPropagation(this._div);
   L.DomEvent.disableScrollPropagation(this._div);
   this.update();
   return this._div;
};

barrioSelected.update = function(idIndicator,nameIndicator) {
   if (!actionPopUpsRequired) {
      if (nameIndicator !== undefined) {
         this._div.innerHTML = '<h4>' + nameIndicator + '</h4>' +  (idIndicator ? action(idIndicator)
            : "Selecciona un indicador en la tabla de la izquierda");
      } else {
         this._div.innerHTML = '<h4>Información</h4>' +  (idIndicator ? action(idIndicator)
            : "Selecciona un indicador en la tabla de la izquierda");
      }
   }
}

barrioSelected.addTo(map);

/*-------- Legend panel --------*/
var legend = L.control({position: 'bottomleft'});
var grades = [];
var divLegend;
legend.onAdd = function (map) {
   divLegend = L.DomUtil.create('div', 'info legend'),
      labels = [];
   // loop through our density intervals and generate a label with a colored square for each interval
   L.DomEvent.disableClickPropagation(divLegend);
   L.DomEvent.disableScrollPropagation(divLegend);
   return divLegend;
};

legend.update = function(num) {
   divLegend.innerHTML = '';
   if (num !== 0) {
      divLegend.innerHTML = '<h4>Leyenda</h4>';
      for (let i = 0; i < grades.length; i++) {
         divLegend.innerHTML +=
            '<i style="background:' + getColorLegend(num,grades[i]) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
   }
}

legend.addTo(map);

/*-------- Escala ciudad panel --------*/
var ciudad = L.control({position: 'bottomright'});
var divCiu;
ciudad.onAdd = function (map) {
   divCiu = L.DomUtil.create('div', 'info ciudad');
   L.DomEvent.disableClickPropagation(divCiu);
   L.DomEvent.disableScrollPropagation(divCiu);
   this.update();
   return divCiu;
};

ciudad.update = function(data,unit) {
   if (data !== undefined) {
      divCiu.innerHTML = '<h4>Escala ciudad </h4>' + data.toFixed(2) + unit;
   } else {
      divCiu.innerHTML = '<h4>Escala ciudad </h4>';
   }
}

ciudad.addTo(map);


/*-------- Indicator functions --------*/

//this is how you change the chart to line, but not really the correct way
// dynamicChart.config.type = 'line'; //changing chart type to line
// dynamicChart.update();
// addDataChart(dynamicChart, myLabels, myData);
//TODO: bug, turns back into bar when (de)activating the legend key
// dynamicChart.config.type = 'bar'; //changing it back to bar after render

//this var is true when an action that requires popups is executed
var actionPopUpsRequired = false;
let actionPropId = ""; // to differentiate between the different actions. using eval() later to execute
function action (idIndicator) {
   removeDataChart(dynamicChart);
   switch (idIndicator) {
      case "k01_01":
         actionPropId = "layer.feature.properties." + idIndicator;
         actionSetUp(actionPropId,"%");
         grades = [0,20,40,60,80];
         legend.update(1);
         // myData = getk01_01();
         myData = getData(idIndicator);
         break;
      case "k01_02":
         actionPropId = "layer.feature.properties." + idIndicator;
         actionSetUp(actionPropId,"%");
         grades = [0,20,40,60,80];
         legend.update(1);
         myData = getData(idIndicator);
         break;
      case "k01_03":
         actionPropId = "layer.feature.properties." + idIndicator;
         actionSetUp(actionPropId,"%");
         grades = [0,20,40,60,80];
         legend.update(1);
         myData = getData(idIndicator);
         break;
      case "k01_04":
         actionPropId = "layer.feature.properties." + idIndicator;
         actionSetUp(actionPropId,"%");
         grades = [0,20,40,60,80];
         legend.update(1);
         myData = getData(idIndicator);
         break;
      case "k02_01":
         actionPropId = "layer.feature.properties." + idIndicator;
         actionSetUp(actionPropId,"%");
         grades = [0,20,40,60,80];
         legend.update(1);
         myData = getData(idIndicator);
         break;
      case "k02_02":
         actionPropId = "layer.feature.properties." + idIndicator;
         actionSetUp(actionPropId,"%");
         grades = [0,20,40,60,80];
         legend.update(1);
         myData = getData(idIndicator);
         break;
      case "k21_01":
         actionPropId = "layer.feature.properties." + idIndicator;
         actionSetUp(actionPropId,"%");
         grades = [0,20,40,60,80];
         legend.update(1);
         myData = getData(idIndicator);
         break;
      case "k21_02":
         actionPropId = "layer.feature.properties." + idIndicator;
         actionSetUp(actionPropId,"%");
         grades = [0,20,40,60,80];
         legend.update(1);
         myData = getData(idIndicator);
         break;
      case "k22":
         actionPropId = "layer.feature.properties." + idIndicator;
         actionSetUp(actionPropId,"%");
         grades = [0,20,40,60,80];
         legend.update(1);
         myData = getData(idIndicator);
         break;
      case "k23_01":
         actionPropId = "layer.feature.properties." + idIndicator;
         actionSetUp(actionPropId,"%");
         grades = [0,20,40,60,80];
         legend.update(1);
         myData = getData(idIndicator);
         break;
      case "k23_02":
         actionPropId = "layer.feature.properties." + idIndicator;
         actionSetUp(actionPropId,"%");
         grades = [0,20,40,60,80];
         legend.update(1);
         myData = getData(idIndicator);
         break;
      case "k23_03":
         actionPropId = "layer.feature.properties." + idIndicator;
         actionSetUp(actionPropId,"%");
         grades = [0,20,40,60,80];
         legend.update(1);
         myData = getData(idIndicator);
         break;
      default:
         return "Selecciona un indicador en la tabla de la izquierda";
   }
   const average = myData.reduce((a, b) => a + b, 0) / myData.length;
   ciudad.update(average,"%");
   longLabelsActive ? addDataChart(dynamicChart, myLabelsLong, myData) : addDataChart(dynamicChart, myLabels, myData);
   return getFuentes(idIndicator);
}

//Sets up the color gradient for each indicator. Also resets popups (important)
function actionSetUp(prop,unit) {
   myLabels = ["1","2","3","4","5","6","8","9","10","11","12",
      "13","14","15","16","17","18","19","20","21","22","23","24"];
   actionPopUpsRequired = true;
   geojson.eachLayer(function (layer) {
      layer.closePopup();
      layer.unbindPopup(); //removing previous popups
      layer.bindPopup("Superficie: " + eval(prop) + unit);
      layer.setStyle({
         fillColor: getColorNum1(eval(prop)),
         stroke: true,
         color: getColorNum1(eval(prop)),
         // color: '#3690c0',
         weight: 1,
         opacity: 1,
         fillOpacity: 0.7
      });
   });
}

/*-------- Getting/calculating data functions --------*/
function getLabels0(sects){
   var labels = [];
   for (let i = 1; i <27; i++) {
      labels.push(sects[i].CSEC); // sectores censales
   }
   return labels;
}

function getData0(sects){
   var pops = [];
   for (let i = 1; i <27; i++) {
      pops.push(sects[i].t1_1);
   }
   return pops;
}
//For the information chart with the full barrios names.
function detailedInfo(data,unit) {
   let str = "";
   let i = 0;
   let y = 1;
   for (let nombreBarrio in barriosData) {
      str += '<b>' + y + ". " + nombreBarrio + '</b>' + '<br/>' + data[i] + unit + '<br/>';
      i++;
      y++;
   }
   return str;
}

function getFuentes(ind) {
   //hacer bucle con el indicador
   var str = '<h3>Fuentes</h3>' +
      'Población: IEACA (2021)' +
      '<br/>' + 'Superficie ámbito: EELL (2022)' +
      '<br/>' + 'Superficie ámbito: EELL (2022)' +
      '<br/>' + 'Superficie ámbito: EELL (2022)' +
      '<br/>' + 'Superficie ámbito: EELL (2022)' +
      '<br/>' + 'Superficie ámbito: EELL (2022)' +
      '<br/>' + 'Superficie ámbito: EELL (2022)' +
      '<br/>' + 'Superficie ámbito: EELL (2022)' +
      '<br/>' + 'Superficie ámbito: EELL (2022)';
   return str;
}

function getData(ind) {
   let strcode = "barriosData[nombreBarrio]." + ind + ";";
   let data = [];
   let i = 0;
   for (let nombreBarrio in barriosData) {
      data[i] = eval(strcode);
      console.log(strcode);
      i++;
   }
   return data;
}

/*-------- Aux functions --------*/
var dynamicColors = function() {
   var r = Math.floor(Math.random() * 255);
   var g = Math.floor(Math.random() * 255);
   var b = Math.floor(Math.random() * 255);
   return "rgba(" + r + "," + g + "," + b + ",0.8"+ ")";
};

for (var i = 0; i<26; i++) {
   colorsChart.push(dynamicColors());
}

/*-------- Styles of layers --------*/
var stylelayer = {
   start: {
      fillColor: '#5498a9',
      stroke: true,
      color: '#42899b',
      // color: '#fff',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7
   },
   default: {
      // fillColor: '#5498a9',
      stroke: true,
      // color: '#3d7685',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7
   },
   highlight: {
      // fillColor: '#5498a9',
      stroke: true,
      // color: '#3d7685',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.9
   }
}

function style(feature) {
   return {
      fillColor: '#5498a9',
      stroke: true,
      // color: '#3d7685',
      color: '#42899b',
      // color: '#fff',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7
   };
}

function style2(feature) {
   return {
      fillColor: '#7a54a9',
      stroke: true,
      color: '#623d85',
      // color: '#fff',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.6
   };
}

function styleNum1(feature) {
   return {
      fillColor: getColorNum1(feature.properties.t1_1),
      stroke: true,
      color: getColorNum1(feature.properties.t1_1),
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7
   };
}

function getColorLegend(num,value) {
   switch (num) {
      case 1: return getColorNum1(value);
      case 3: return getColorNum3(value);
   }
}

function getColorNum1(value) {
   return   value >= 80  ? '#964567' :
      value >= 60  ? '#8C5788' :
         value >= 40  ? '#607CAC' :
            value >= 20  ? '#508CAE' :
               '#5498A9';
}

// function getColorNum1(value) {
//    return   value >= 80  ? '#034e7b' :
//             value >= 60  ? '#0570b0' :
//             value >= 40  ? '#3690c0' :
//             value >= 20  ? '#74a9cf' :
//             '#a6bddb';
// }

function getColorNum3(value) {
   return   value > 2000 ? '#006d2c' :
      value > 1500  ? '#2ca25f' :
         value > 1000  ? '#66c2a4' :
            value > 800  ? '#99d8c9' :
               value > 600   ? '#ccece6' :
                  '#edf8fb';
}