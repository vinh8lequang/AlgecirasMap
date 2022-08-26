/*-------- Map visualization --------*/
var map = L.map('map', {
   // maxBounds: [
   //     //south west
   //     [36.067050, -5.594750],
   //     //north east
   //     [36.192343, -5.395024]
   // ],
   maxZoom: 17,
   minZoom: 10,
   // layers: [googleStreets, cities]
}).setView([36.113,-5.46], 13);

map.setMaxBounds(map.getBounds());

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

   },10000)
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

/*-------- Loading data --------*/
var barriosData = {};
var myLabelsLong = [];
var longLabelsActive = false;
barrios.features.forEach(loadData);
function loadData(item){
   let nombreBarrio = item.properties.barrio;
   myLabelsLong.push(nombreBarrio);
   barriosData[nombreBarrio] = item.properties;
}

extrainfo = extrainfo.features; //just getting the arrays from extrainfo

/*-------- Map interaction --------*/
function highlightFeature(e) {
   let layer = e.target;
   layer.setStyle(stylelayer.highlight);

   if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
   }
   try { //remove error messages
      info.update(layer.feature.properties);
   } catch (e) {
      //Do nothing
   }
}

function resetHighlight(e) {
   let layer = e.target;
   layer.setStyle(stylelayer.default);
   try { //remove error messages
      info.update();
   } catch (err) {
      //Do nothing
   }
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
let arrow1 = document.querySelectorAll(".arrowcat");
let iconLink2 = document.querySelectorAll(".icon_link2");
let arrow2 = document.querySelectorAll(".arrowsub");
let sidebar = document.querySelector(".sidebar");
let menuButton = document.querySelector("#menubtn");
let introButton = document.querySelector("#introbtn");
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
let k03 = document.querySelector("#k03").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k03","Superficie del suelo no reutilizable (%)");
};
let k04 = document.querySelector("#k04").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k04","Suelo urbano discontinuo (%)");
};
let k05 = document.querySelector("#k05").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k05","Densidad de población en suelo urbano (hab/ha)");
};
let k06 = document.querySelector("#k06").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k06","Densidad de vivienda (viv/hab)");
};
let k07 = document.querySelector("#k07").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k07","Compacidad urbana (m²t/m²s)");
};
let k08_01 = document.querySelector("#k08_01").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k08_01","Superficie construida uso residencial (m²t/m²s)");
};
let k08_02 = document.querySelector("#k08_02").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k08_02","Superficie construida uso residencial (%)");
};
let k09 = document.querySelector("#k09").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k09","Superficie verde (ha/1000hab)");
};
let k10_01 = document.querySelector("#k10_01").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k10_01","Zonas verdes por habitante");
};
let k10_02 = document.querySelector("#k10_02").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k10_02","Densidad zonas verdes (%)");
};
let k10_03 = document.querySelector("#k10_03").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k10_03","Proximidad a zonas verdes y áreas de esparcimiento (%)");
};
let k12_01 = document.querySelector("#k12_01").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k12_01","Longitud calles peatonales (%)");
};
let k13_01 = document.querySelector("#k13_01").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k13_01","Superficie infraestructuras de transporte (ha)");
};
let k13_02 = document.querySelector("#k13_02").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k13_02","Superficie infraestructuras de transporte (%)");
};
let k16 = document.querySelector("#k16").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k16","Accesibilidad a los servicios de transporte público (%)");
};
let k17 = document.querySelector("#k17").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k17","Dotación de vías ciclistas (km/1000hab)");
};
let k18 = document.querySelector("#k18").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k18","Zona de bajas emisiones (ZBE) (%)");
};
let k20 = document.querySelector("#k20").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k20","Variación de la población 2007-2017 (%)");
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
let k24 = document.querySelector("#k24").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k24","Parque de vivienda (viv/1000hab)");
};
let k26 = document.querySelector("#k26").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k26","Antigüedad del parque edificatorio. Parque edificatorio anterior al año 2000 (%)");
};
let k49_01 = document.querySelector("#k49_01").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k49_01","Cobertura artificial (%)");
};
let k49_02 = document.querySelector("#k49_02").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k49_02","Cobertura vegetal natural (%)");
};
let k49_03 = document.querySelector("#k49_03").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k49_03","Cultivos (%)");
};
let k49_04 = document.querySelector("#k49_04").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k49_04","Zonas húmedas y superficies de agua (%)");
};
let k50 = document.querySelector("#k50").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k50","Longitud y extensión de corredores verdes (ML)");
};
let k51 = document.querySelector("#k51").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k51","Presencia de especies y espacios naturales protegidos (%)");
};
let k52 = document.querySelector("#k52").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k52","Índice de vegetación (NDVI) (%)");
};
let k53 = document.querySelector("#k53").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k53","Red de senderos (ML por barrio) (ML)");
};
let k54 = document.querySelector("#k54").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k54","Nitratos en el suelo (%)");
};
let k55 = document.querySelector("#k55").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k55","Movimientos de terreno (%)");
};
let k57 = document.querySelector("#k57").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k57","Isla de calor urbana (%)");
};
let k58 = document.querySelector("#k58").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k58","Inundabilidad urbana (%)");
};
let k60_01 = document.querySelector("#k60_01").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k60_01","Establecimientos en sector agricultura (%)");
};
let k60_02 = document.querySelector("#k60_02").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k60_02","Establecimientos en sector industria (%)");
};
let k60_03 = document.querySelector("#k60_03").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k60_03","Establecimientos en sector construcción (%)");
};
let k60_04 = document.querySelector("#k60_04").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k60_04","Establecimientos en sector servicios (%)");
};
let k62 = document.querySelector("#k62").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k62","Renta media por hogar (€)");
};
let k64_01 = document.querySelector("#k64_01").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k64_01","Zona de patrimonio histórico cultural");
};
let k64_02 = document.querySelector("#k64_02").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k64_02","aaaaa");
};
let k70 = document.querySelector("#k70").onclick = function() {
   actionPopUpsRequired = false;
   barrioSelected.update("k70","Participación en elecciones municipales");
};

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

for (let i = 0; i < arrow1.length; i++) {
    arrow1[i].addEventListener("click",(e)=>{
        dropTables1[i] = e.target.parentElement.parentElement;
        // console.log("arrow: "+dropTables1[i]);
        dropTables1[i].classList.toggle("showmenu1");
    })
}

for (let i = 0; i < iconLink2.length; i++) {
   iconLink2[i].addEventListener("click",(e)=>{
      var element = e.target.parentElement.parentElement.parentElement;
      //this if is to solve the bug when "li" is clicked instead of clicking on "icon_link1"
      if (element.classList.value === "showmenu2" ||
         element.classList.value === "") {
         dropTables2[i] = element;
         // let dropTable = e.target.parentElement.parentElement.parentElement;
         dropTables2[i].classList.toggle("showmenu2");
      }
   })
}

for (let i = 0; i < arrow2.length; i++) {
    arrow2[i].addEventListener("click",(e)=>{
        dropTables2[i] = e.target.parentElement.parentElement;
        // console.log(dropTable);
        dropTables2[i].classList.toggle("showmenu2");
    })
}

//on mouse enter and leave, the sidebar expands and collapses
let sidebarStatic  = false;
function toggleSidebar() {
   if (!sidebarStatic) {
      // console.log(sidebar.classList.value);
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

introButton.onclick = function() {
   const elements = document.getElementsByClassName("intro");
   while(elements.length > 0){
      elements[0].parentNode.removeChild(elements[0]);
   }

   sidebar.classList.toggle("active");
   sidebar.classList.toggle("startup");
   zoomIcon.classList.toggle("active");
   layersIcon.classList.toggle("active");
   sidebar.addEventListener("mouseleave",toggleSidebar,false);
   sidebar.addEventListener("mouseenter",toggleSidebar,false);

}

/*-------- Banner panel --------*/
var banner = L.control({position: 'bottomright'});
var divBanner;
banner.onAdd = function (map) {
   divBanner = L.DomUtil.create('div', 'info banner');
   L.DomEvent.disableClickPropagation(divBanner);
   L.DomEvent.disableScrollPropagation(divBanner);
   this.update();
   return divBanner;
};

banner.update = function() {
   divBanner.innerHTML = '<img src="resources/images/banner.png" alt="" id="mapbanner">';
}

banner.addTo(map);

/*-------- Charts --------*/
var myLabel = "";
var myLabels = [];
var myData = [];
// var colorsChart = [];
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

const config = {
   type: 'bar', //doughnut,pie,
   data: {
      labels: myLabels,
      datasets: [{
         // backgroundColor: colorsChart,
         backgroundColor: color => {
            return updateBarGrades();
         },
         // backgroundColor: '#3d7685',
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
         },
         tooltip: {
            displayColors: false,
            // titleColor: '#232323',
            // bodyColor: '#232323',
            // backgroundColor: '#3d7685'
         }
      }
   }
};

var dynamicChart = new Chart(myChart,config);

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
      divCiu.innerHTML = '<h4>Escala ciudad </h4>' + '<span class="ciudadvalor">' + data.toFixed(4) + ' ' + unit + '</span>';
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
var actionPropId = ""; // to differentiate between the different actions. using eval() later to execute
var unit;
function action (idIndicator) {
   removeDataChart(dynamicChart);
   switch (idIndicator) {
      case "k01_01":
         unit = "%";
         break;
      case "k01_02":
         unit = "%";
         break;
      case "k01_03":
         unit = "%";
         break;
      case "k01_04":
         unit = "%";
         break;
      case "k02_01":
         unit = "%";
         break;
      case "k02_02":
         unit = "%";
         break;
      case "k03":
         unit = "%";
         break;
      case "k04":
         unit = "%";
         break;
      case "k05":
         unit = "hab/ha";
         break;
      case "k06":
         unit = "viv/hab";
         break;
      case "k07":
         unit = "m²t/m²s";
         break;
      case "k08_01":
         unit = "m²t/m²s";
         break;
      case "k08_02":
         unit = "%";
         break;
      case "k09":
         unit = "ha/1000hab";
         break;
      case "k10_01":
         unit = "zon/hab";
         break;
      case "k10_02":
         unit = "%";
         break;
      case "k10_03":
         unit = "%";
         break;
      case "k12_01":
         unit = "%";
         break;
      case "k13_01":
         unit = "ha";
         break;
      case "k13_02":
         unit = "%";
         break;
      case "k16":
         unit = "%";
         break;
      case "k17":
         unit = "km/1000hab";
         break;
      case "k18":
         unit = "%";
         break;
      case "k20":
         unit = "%";
         break;
      case "k21_01":
         unit = "%";
         break;
      case "k21_02":
         unit = "%";
         break;
      case "k22":
         unit = "%";
         break;
      case "k23_01":
         unit = "%";
         break;
      case "k23_02":
         unit = "%";
         break;
      case "k23_03":
         unit = "%";
         break;
      case "k24":
         unit = "viv/1000hab";
         break;
      case "k26":
         unit = "%";
         break;
      case "k49_01":
         unit = "%";
         break;
      case "k49_02":
         unit = "%";
         break;
      case "k49_03":
         unit = "%";
         break;
      case "k49_04":
         unit = "%";
         break;
      case "k50":
         unit = "ML";
         break;
      case "k51":
         unit = "%";
         break;
      case "k52":
         unit = "%";
         break;
      case "k53":
         unit = "ML";
         break;
      case "k54":
         unit = "%";
         break;
      case "k55":
         unit = "%";
         break;
      case "k57":
         unit = "%";
         break;
      case "k58":
         unit = "%";
         break;
      case "k60_01":
         unit = "%";
         break;
      case "k60_02":
         unit = "%";
         break;
      case "k60_03":
         unit = "%";
         break;
      case "k60_04":
         unit = "%";
         break;
      case "k62":
         unit = "€";
         break;
      case "k64_01":
         unit = "";
         break;
      case "k64_02":
         unit = "";
         break;
      case "k70":
         unit = "";
         break;
      default:
         return "Selecciona un indicador en la tabla de la izquierda";
   }
   actionPropId = "layer.feature.properties." + idIndicator;
   myData = getData(idIndicator);
   updateLegendGrades(idIndicator);
   updateBarGrades();
   actionSetUp(actionPropId);
   var ciudadValue = Number(eval("extrainfo[0].properties." + idIndicator + ";"));
   ciudad.update(ciudadValue,unit);
   longLabelsActive ? addDataChart(dynamicChart, myLabelsLong, myData) : addDataChart(dynamicChart, myLabels, myData);
   return getFuentes(idIndicator);
}

//Sets up the color gradient for each indicator. Also resets popups (important)
function actionSetUp(prop) {
   myLabels = ["1","2","3","4","5","6","7","8","9","10","11","12",
      "13","14","15","16","17","18","19","20","21","22","23","24"];
   actionPopUpsRequired = true;
   geojson.eachLayer(function (layer) {
      layer.closePopup();
      layer.unbindPopup(); //removing previous popups
      var barrioName = layer.feature.properties.barrio;
      layer.bindPopup("<h4 style=\"text-align:center;\">" +
         getBarrioNumber(barrioName) + ". " + barrioName +
         "</h4>" +
         "<p style=\"text-align:center;\">" + eval(prop) + " " + unit + "</p>");
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
   legend.update(1);
}

function updateLegendGrades(ind) {
   var grade0 = "extrainfo[3].properties." + ind + ";";
   var grade1 = "extrainfo[4].properties." + ind + ";";
   var grade2 = "extrainfo[5].properties." + ind + ";";
   var grade3 = "extrainfo[6].properties." + ind + ";";
   var grade4 = "extrainfo[7].properties." + ind + ";";
   // var grade5 = "extrainfo[8].properties." + ind + ";";
   var color0 = eval(grade0);
   var color1 = eval(grade1);
   var color2 = eval(grade2);
   var color3 = eval(grade3);
   var color4 = eval(grade4);
   // var color5 = eval(grade5);
   grades = [Number(color0),Number(color1),Number(color2),Number(color3),Number(color4)];
}

function updateBarGrades() {
   // for (let i in myData) {
   //    colorsChart.push(getColorNum1(myData[i]))
   // }
   var colors = [];
   for (let i in myData) {
      colors.push(getColorNum1(myData[i]))
   }
   return colors;
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
   var strcode1 = "extrainfo[1].properties." + ind + ";";
   var strcode2 = "extrainfo[2].properties." + ind + ";";
   var fuente1 = eval(strcode1);
   var fuente2 = eval(strcode2);
   if ((fuente1 === undefined || fuente1 === null) &&
      (fuente2 === undefined || fuente2 === null)) {
      return '<h3>Fuentes</h3>' + "No disponibles";
   } else if (fuente1 === undefined || fuente1 === null) {
      return '<h3>Fuentes</h3>' + fuente2;
   } else if (fuente2 === undefined || fuente2 === null){
      return '<h3>Fuentes</h3>' + fuente1;
   } else {
      return '<h3>Fuentes</h3>' + fuente1 + '<br/>' + fuente2;
   }
}

function getData(ind) {
   var strcode = "barriosData[nombreBarrio]." + ind + ";";
   var data = [];
   var i = 0;
   for (let nombreBarrio in barriosData) {
      data[i] = Number(eval(strcode));
      // console.log(data[i]);
      i++;
   }
   return data;
}

/*-------- Aux functions --------*/
// var dynamicColors = function() {
//    var r = Math.floor(Math.random() * 255);
//    var g = Math.floor(Math.random() * 255);
//    var b = Math.floor(Math.random() * 255);
//    return "rgba(" + r + "," + g + "," + b + ",0.8"+ ")";
// };
//
// for (var i = 0; i<26; i++) {
//    colorsChart.push(dynamicColors());
// }

/**
 * Receives barrio name and returns number of barrio, starting from 1.
 * @param barrio
 * @returns {number}
 */
function getBarrioNumber(barrio) {
   for (var i = 0; i <myLabelsLong.length; i++) {
      if (myLabelsLong[i] === barrio) {
         return i + 1;
      }
   }
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
      fillOpacity: 0.7
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
   return value >= grades[4]  ? '#964567' :
          value >= grades[3]  ? '#8C5788' :
          value >= grades[2]  ? '#607CAC' :
          value >= grades[1]  ? '#508CAE' :
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