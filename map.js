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
}).setView([36.113,-5.48], 13);

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

var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

var layer1 = L.layerGroup().addTo(map);
var layer2 = L.layerGroup();
var layer3 = L.layerGroup();


var baseMaps = {
    "Open Street Maps": osmMap,
    "Google Streets": googleStreets,
    "Google Hybrid": googleHybrid,
    "Light Map": lightMap,
    "Dark Map": darkMap,
    // "Google Satellite": googleSat,
    // "Google Terrain": googleTerrain
};

var geojson = L.geoJson(algeciras, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

var geojson2 = L.geoJson(mallas, {
    style: style2,
    onEachFeature: onEachFeature2
});

var geojson3 = L.geoJson(barrios, {
    style: style,
    onEachFeature: onEachFeature3
});

var overlayMaps = {
    "Sectores censales": layer1, // an option to show or hide the layer you created from geojson
    "Mallas": layer2,
    "Barrios": layer3
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
    if (event.name === "Sectores censales") {
        if (map.hasLayer(layer2)) {
            console.log("remove layer2");
            removeWithTimeout(layer2);
        }
        if (map.hasLayer(layer3)) {
            console.log("remove layer3");
            removeWithTimeout(layer3);
        }
    }
    else if (event.name === "Mallas") {
        if (map.hasLayer(layer1)) {
            console.log("remove layer1");
            removeWithTimeout(layer1);
        }
        if (map.hasLayer(layer3)) {
            console.log("remove layer3");
            removeWithTimeout(layer3);
        }
    }
    else { //(event.name === "Barrios")
        if (map.hasLayer(layer1)) {
            console.log("remove layer1");
            removeWithTimeout(layer1);
        }
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

var sectors = new Object();
algeciras.features.forEach(loadData);
function loadData(item){
    var idNum = Number(item.properties.secc);
    sectors[idNum] = item.properties;
}

/*-------- Map interaction --------*/
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle(stylelayer.highlight);

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    var layer = e.target;
    layer.setStyle(stylelayer.default);
	info.update();
}

function showSpecDetails(e) {
    var layer = e.target;
    // map.fitBounds(e.target.getBounds());
    sectionselected.update(layer.feature.properties);
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

function onEachFeature3(feature, layer) {
    layer3.addLayer( layer );
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

let ind1 = document.querySelector("#ind1");
let ind2 = document.querySelector("#ind2");
let ind3 = document.querySelector("#ind3");
let ind4 = document.querySelector("#ind4");


for (let i = 0; i < iconLink1.length; i++) {
    iconLink1[i].addEventListener("click",(e)=>{
        dropTables1[i] = e.target.parentElement.parentElement.parentElement;
        // let dropTable = e.target.parentElement.parentElement.parentElement;
        dropTables1[i].classList.toggle("showmenu1");
    })
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
        sidebar.classList.toggle("active");
        console.log(sidebar.classList.value);
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

ind1.onclick = function() {
    actionPopUpsRequired = false;
    sectionselected.update(1);
}
ind2.onclick = function() {
    actionPopUpsRequired = false;
    sectionselected.update(2);
}
ind3.onclick = function() {
    actionPopUpsRequired = false;
    sectionselected.update(3);
}
ind4.onclick = function() {
    actionPopUpsRequired = false;
    sectionselected.update(4);
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
    div.innerHTML += '<h4> Gráfica </h4>';
    div.innerHTML += '<button id="chartbtn"> Cambiar tamaño </button>'
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
            backgroundColor: colorsChart,
            // backgroundColor: '#5498a9',
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
    for(var i in label) {
        chart.data.labels.push(label[i]);
    }
    for(var j in data) {
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
}

/*-------- Information panel --------*/
var sectionselected = L.control({position: 'topright'});

sectionselected.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info details_scroller');
    L.DomEvent.disableClickPropagation(this._div);
    L.DomEvent.disableScrollPropagation(this._div);
    this.update();
    return this._div;
};

sectionselected.update = function(num) {
    if (!actionPopUpsRequired) {
        this._div.innerHTML = '<h4>Información</h4>' +  (num ? action(num)
            : "Selecciona un indicador en la tabla de la izquierda");
        // var div = document.querySelector(".sidebar .logo_content .logo_name");
        // div.innerHTML= '<h4>Indicadores</h4>' +  (num ? action(num)
        //      : "Selecciona un indicador en la tabla de la izquierda");
    }
}

sectionselected.addTo(map);

/*-------- Legend panel --------*/
var legend = L.control({position: 'bottomleft'});
var grades = [];
var div;
legend.onAdd = function (map) {
    div = L.DomUtil.create('div', 'info legend'),
        labels = [];
    // loop through our density intervals and generate a label with a colored square for each interval
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    return div;
};

legend.update = function(num) {
    div.innerHTML = '';
    if (num !== 0) {
        div.innerHTML = '<h4>Leyenda</h4>';
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColorLegend(num,grades[i]) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    }
}

legend.addTo(map);


/*-------- Indicator functions --------*/
//this var is true when an action that requires popups is executed
var actionPopUpsRequired = false;
function action (num) {
    removeDataChart(dynamicChart);
    switch (num) {
        case 1:
            actionPopUpsRequired = true;
            geojson.eachLayer(function (layer) {
                //code smell: this can be shorten with an aux function
                layer.closePopup();
                layer.unbindPopup(); //removing previous popups
                layer.bindPopup("Población: " + layer.feature.properties.t1_1);
                layer.setStyle({
                    fillColor: getColorNum1(layer.feature.properties.t1_1),
                    stroke: true,
                    color: getColorNum1(layer.feature.properties.t1_1),
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.6
                });
            });
            grades = [1000,1500,2500,3500,4500];
            legend.update(1);
            myLabels = ["Población"];
            myData = [getPoblacionTotal()];
            addDataChart(dynamicChart, myLabels, myData);
            return 'Población total: ' + myData[0] + '<br/><br/>' +
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dignissim convallis aenean et tortor at risus. Euismod nisi porta lorem mollis aliquam ut porttitor leo. Quis commodo odio aenean sed adipiscing diam donec adipiscing. Lectus sit amet est placerat in egestas erat imperdiet sed. Amet purus gravida quis blandit turpis cursus in hac. Id venenatis a condimentum vitae sapien pellentesque. Dignissim suspendisse in est ante in nibh mauris. Est lorem ipsum dolor sit amet consectetur. Ut lectus arcu bibendum at. Quis vel eros donec ac odio tempor orci dapibus ultrices. Nec nam aliquam sem et tortor consequat.\n' +
                '<br/>' +
                'Fringilla est ullamcorper eget nulla facilisi etiam dignissim diam. Commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Eget egestas purus viverra accumsan in nisl nisi. Commodo odio aenean sed adipiscing diam donec adipiscing tristique risus. Quis risus sed vulputate odio ut enim blandit volutpat. Elit sed vulputate mi sit. Massa ultricies mi quis hendrerit dolor. Fermentum odio eu feugiat pretium nibh ipsum. Nec tincidunt praesent semper feugiat nibh. Egestas integer eget aliquet nibh praesent tristique. Varius sit amet mattis vulputate enim nulla aliquet porttitor lacus. Amet cursus sit amet dictum sit amet. Enim nunc faucibus a pellentesque sit amet porttitor eget. Orci nulla pellentesque dignissim enim sit amet venenatis. Pretium aenean pharetra magna ac. Orci porta non pulvinar neque laoreet.\n' +
                '<br/>' +
                'Nec feugiat in fermentum posuere urna nec tincidunt praesent semper. Aliquet bibendum enim facilisis gravida. Tortor pretium viverra suspendisse potenti nullam ac tortor vitae purus. Sed vulputate mi sit amet mauris commodo quis. Sed augue lacus viverra vitae congue eu. Tincidunt dui ut ornare lectus sit amet est placerat. Lacus vestibulum sed arcu non odio. Dui sapien eget mi proin. Lacus sed turpis tincidunt id aliquet risus feugiat in. Sed libero enim sed faucibus turpis in.\n' +
                '<br/>' +
                'Diam maecenas ultricies mi eget mauris pharetra et ultrices. In hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Duis ultricies lacus sed turpis tincidunt id aliquet risus feugiat. Quis hendrerit dolor magna eget est lorem ipsum dolor sit. Libero nunc consequat interdum varius sit amet mattis vulputate. Arcu non odio euismod lacinia at quis risus sed. Dictum varius duis at consectetur lorem donec massa. Eget mauris pharetra et ultrices. Risus nullam eget felis eget nunc lobortis mattis. Aliquet porttitor lacus luctus accumsan tortor posuere. Dui faucibus in ornare quam viverra. Neque gravida in fermentum et sollicitudin ac orci phasellus. Nisl suscipit adipiscing bibendum est ultricies integer quis auctor. Iaculis nunc sed augue lacus. Varius morbi enim nunc faucibus.\n' +
                '<br/>' +
                'Nunc mattis enim ut tellus elementum sagittis vitae et. Ante metus dictum at tempor. Ac turpis egestas maecenas pharetra. Potenti nullam ac tortor vitae purus faucibus. Gravida cum sociis natoque penatibus et magnis dis parturient. Iaculis nunc sed augue lacus viverra vitae. Sit amet tellus cras adipiscing. Mus mauris vitae ultricies leo integer. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Varius morbi enim nunc faucibus a pellentesque sit amet. Eu consequat ac felis donec et odio pellentesque diam volutpat. Rhoncus aenean vel elit scelerisque mauris. Placerat vestibulum lectus mauris ultrices eros in. Tempor nec feugiat nisl pretium fusce id velit ut tortor. Integer feugiat scelerisque varius morbi enim nunc faucibus a. Dui sapien eget mi proin sed libero enim sed faucibus. Convallis a cras semper auctor neque vitae tempus.' + '<br/>' +

                '<br/>';
        case 2:
            actionPopUpsRequired = true;
            geojson.eachLayer(function (layer) {
                layer.closePopup();
                layer.unbindPopup(); //removing previous popups
                layer.bindPopup("Hombres: " + layer.feature.properties.t2_1 + "<br>" +
                                    "Mujeres: " + layer.feature.properties.t2_2);
                layer.setStyle(stylelayer.start);
            });
            legend.update(0);
            myLabels = ["Hombres","Mujeres"];
            myData = getNumHombresMujeres();
            addDataChart(dynamicChart, myLabels, myData);
            return  'Hombres: ' + myData[0] + '<br/>' +
                'Mujeres: ' + myData[1] + '<br/>' +
                'Ratio: ' + funDivision(myData[0],myData[1]) + '<br/>';
        case 3:
            actionPopUpsRequired = true;
            geojson.eachLayer(function (layer) {
                layer.closePopup();
                layer.unbindPopup();
                layer.bindPopup("Viviendas: " + layer.feature.properties.t16_1);
                layer.setStyle({
                    fillColor: getColorNum3(layer.feature.properties.t1_1),
                    stroke: true,
                    color: getColorNum3(layer.feature.properties.t1_1),
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.6
                });
            });
            grades = [600,800,1000,1500,2000];
            legend.update(3);
            myLabels = ["Viviendas"];
            myData = [getNumViviendasTotal()];
            addDataChart(dynamicChart, myLabels, myData);
            return 'Viviendas total: ' + myData[0] + '<br/>';
        case 4:
            actionPopUpsRequired = true;
            geojson.eachLayer(function (layer) {
                layer.closePopup();
                layer.unbindPopup();
                layer.bindPopup("1 habitación: " + layer.feature.properties.t20_1 + "<br>" +
                                "2 habitaciones: " + layer.feature.properties.t20_2 + "<br>" +
                                "3 habitaciones: " + layer.feature.properties.t20_3 + "<br>" +
                                "4 habitaciones: " + layer.feature.properties.t20_4 + "<br>" +
                                "5 habitaciones: " + layer.feature.properties.t20_5 + "<br>" +
                                "6 habitaciones: " + layer.feature.properties.t20_6 + "<br>" +
                                "7 habitaciones: " + layer.feature.properties.t20_7 + "<br>" +
                                "8 habitaciones: " + layer.feature.properties.t20_8 + "<br>" +
                                "+9 habitaciones: " + layer.feature.properties.t20_9);
                layer.setStyle(stylelayer.start);
            });
            legend.update(0);
            // myLabels = ["1 habitación","2 habitaciones","3 habitaciones","4 habitaciones",
            //             "5 habitaciones","6 habitaciones","7 habitaciones","8 habitaciones","+9 habitaciones"];
            myLabels = ["1","2","3","4","5","6","7","8","+9"];
            myData = getViviendasHabitaciones();
            //this is how you change the chart to line, but not really the correct way
            // dynamicChart.config.type = 'line'; //changing chart type to line
            // dynamicChart.update();
            addDataChart(dynamicChart, myLabels, myData);
            //TODO: bug, turns back into bar when (de)activating the legend key
            // dynamicChart.config.type = 'bar'; //changing it back to bar after render
            return  '1 habitación: ' + myData[0] + '<br/>' +
                '2 habitaciones: ' + myData[1] + '<br/>' +
                '3 habitaciones: ' + myData[2] + '<br/>' +
                '4 habitaciones: ' + myData[3] + '<br/>' +
                '5 habitaciones: ' + myData[4] + '<br/>' +
                '6 habitaciones: ' + myData[5] + '<br/>' +
                '7 habitaciones: ' + myData[6] + '<br/>' +
                '8 habitaciones: ' + myData[7] + '<br/>' +
                '9 o más habitaciones: ' + myData[8] + '<br/>' +
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dignissim convallis aenean et tortor at risus. Euismod nisi porta lorem mollis aliquam ut porttitor leo. Quis commodo odio aenean sed adipiscing diam donec adipiscing. Lectus sit amet est placerat in egestas erat imperdiet sed. Amet purus gravida quis blandit turpis cursus in hac. Id venenatis a condimentum vitae sapien pellentesque. Dignissim suspendisse in est ante in nibh mauris. Est lorem ipsum dolor sit amet consectetur. Ut lectus arcu bibendum at. Quis vel eros donec ac odio tempor orci dapibus ultrices. Nec nam aliquam sem et tortor consequat.\n' +
                '<br/>' +
                'Fringilla est ullamcorper eget nulla facilisi etiam dignissim diam. Commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Eget egestas purus viverra accumsan in nisl nisi. Commodo odio aenean sed adipiscing diam donec adipiscing tristique risus. Quis risus sed vulputate odio ut enim blandit volutpat. Elit sed vulputate mi sit. Massa ultricies mi quis hendrerit dolor. Fermentum odio eu feugiat pretium nibh ipsum. Nec tincidunt praesent semper feugiat nibh. Egestas integer eget aliquet nibh praesent tristique. Varius sit amet mattis vulputate enim nulla aliquet porttitor lacus. Amet cursus sit amet dictum sit amet. Enim nunc faucibus a pellentesque sit amet porttitor eget. Orci nulla pellentesque dignissim enim sit amet venenatis. Pretium aenean pharetra magna ac. Orci porta non pulvinar neque laoreet.\n' +
                '<br/>' +
                'Nec feugiat in fermentum posuere urna nec tincidunt praesent semper. Aliquet bibendum enim facilisis gravida. Tortor pretium viverra suspendisse potenti nullam ac tortor vitae purus. Sed vulputate mi sit amet mauris commodo quis. Sed augue lacus viverra vitae congue eu. Tincidunt dui ut ornare lectus sit amet est placerat. Lacus vestibulum sed arcu non odio. Dui sapien eget mi proin. Lacus sed turpis tincidunt id aliquet risus feugiat in. Sed libero enim sed faucibus turpis in.\n' +
                '<br/>' +
                'Diam maecenas ultricies mi eget mauris pharetra et ultrices. In hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Duis ultricies lacus sed turpis tincidunt id aliquet risus feugiat. Quis hendrerit dolor magna eget est lorem ipsum dolor sit. Libero nunc consequat interdum varius sit amet mattis vulputate. Arcu non odio euismod lacinia at quis risus sed. Dictum varius duis at consectetur lorem donec massa. Eget mauris pharetra et ultrices. Risus nullam eget felis eget nunc lobortis mattis. Aliquet porttitor lacus luctus accumsan tortor posuere. Dui faucibus in ornare quam viverra. Neque gravida in fermentum et sollicitudin ac orci phasellus. Nisl suscipit adipiscing bibendum est ultricies integer quis auctor. Iaculis nunc sed augue lacus. Varius morbi enim nunc faucibus.\n' +
                '<br/>' +
                'Nunc mattis enim ut tellus elementum sagittis vitae et. Ante metus dictum at tempor. Ac turpis egestas maecenas pharetra. Potenti nullam ac tortor vitae purus faucibus. Gravida cum sociis natoque penatibus et magnis dis parturient. Iaculis nunc sed augue lacus viverra vitae. Sit amet tellus cras adipiscing. Mus mauris vitae ultricies leo integer. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Varius morbi enim nunc faucibus a pellentesque sit amet. Eu consequat ac felis donec et odio pellentesque diam volutpat. Rhoncus aenean vel elit scelerisque mauris. Placerat vestibulum lectus mauris ultrices eros in. Tempor nec feugiat nisl pretium fusce id velit ut tortor. Integer feugiat scelerisque varius morbi enim nunc faucibus a. Dui sapien eget mi proin sed libero enim sed faucibus. Convallis a cras semper auctor neque vitae tempus.' + '<br/>' +
                '<br/>';
        case 5:
            geojson.eachLayer(function (layer) {
                //code smell: this can be shorten with an aux function
                geojson.removeLayer(layer);
            });
            break;
        case 6:
            geojson = L.geoJson(algeciras, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);
            break;
        default:
            return "Selecciona un indicador en la tabla de la izquierda";
    }
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

function getNumHombresMujeres(){
    var hom = 0;
    var muj = 0;
    for (let i in sectors) {
        hom += sectors[i].t2_1;
        muj += sectors[i].t2_2;
    }
    return [hom, muj];
}

function funDivision(num,denom) {
    return (num/denom).toFixed(3);
}

function getPoblacionTotal() {
    var poblacionTotal = 0;
    for (let i in sectors) {
        poblacionTotal += sectors[i].t1_1;
    }
    // the horrible looking code below is for the point in the number 10000 -> 10.000
    // return poblacionTotal.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return poblacionTotal;
}

function getNumViviendasTotal () {
    var viviendasTotal = 0;
    for (var i in sectors) {
        viviendasTotal += sectors[i].t16_1;
    }
    return viviendasTotal;
}

function getViviendasHabitaciones() {
    var hab1 = 0; var hab2 = 0; var hab3 = 0; var hab4 = 0;
    var hab5 = 0; var hab6 = 0; var hab7 = 0; var hab8 = 0; var hab9 = 0;
    for (let i in sectors) {
        hab1 += sectors[i].t20_1;
        hab2 += sectors[i].t20_2;
        hab3 += sectors[i].t20_3;
        hab4 += sectors[i].t20_4;
        hab5 += sectors[i].t20_5;
        hab6 += sectors[i].t20_6;
        hab7 += sectors[i].t20_7;
        hab8 += sectors[i].t20_8;
        hab9 += sectors[i].t20_9;
    }
    return [hab1, hab2, hab3, hab4, hab5, hab6, hab7, hab8, hab9];
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
        fillOpacity: 0.6
    },
    default: {
        // fillColor: '#5498a9',
        stroke: true,
        // color: '#3d7685',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.6
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
        fillOpacity: 0.6
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
    return value > 4500 ? '#800026' :
        value > 3500  ? '#BD0026' :
            value > 2500  ? '#E31A1C' :
                value > 1500  ? '#FC4E2A' :
                    value > 1000   ? '#FD8D3C' :
                        '#FFEDA0';
}

function getColorNum3(value) {
    return value > 2000 ? '#006d2c' :
        value > 1500  ? '#2ca25f' :
            value > 1000  ? '#66c2a4' :
                value > 800  ? '#99d8c9' :
                    value > 600   ? '#ccece6' :
                        '#edf8fb';
}
