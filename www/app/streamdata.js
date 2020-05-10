var datahasil,datapesan,pesan="no message",timecek;
//var Head,AccX,AccY,AccZ,GyroX = 0,GyroY = 0,GyroZ = 0,Baro,Vspe,Compas,Roll,Pitch,Yaw,Altit,Latit,Longi;
var Newaltid,Tampung = 0,Apogee;
var totalPoints = 50;
var totalPointsplot = 1000;
var imgs,Wow,Waktu,wat;
var gy,gx,gz;
var hasilnya = 0;
var valid = "false";

var distance;

var dir = "foto/";
var fileextension = ".jpeg"
$.ajax({
    url: 'listGambar',
    success: function (data) {
        imgs = data.data;
        update();
    }
});
var arrImgs = [];

var GYX = [],
    GYY = [],
    GYZ = [],
    path = [];
    var Compas = 0, Vspe = 0;
//declare for box
var stage = Sprite3D.stage(document.querySelector("#sikap"));
var box = Sprite3D.box(80,225,80, ".cube");
box.rotation(0,40,0);
box.update();
stage.appendChild(box);

//awal count
var seconds = 0, minutes = 0, hours = 0, t;
function add() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    document.getElementById('timeplus').innerHTML = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    timer();
}
function timer() {
    t = setTimeout(add, 1000);
}


//akhir count
//awal jam
function checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
}
function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    // add a zero in front of numbers<10
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('timess').innerHTML = h + ":" + m + ":" + s;
    t = setTimeout(function() {
        startTime()
    }, 500);
}
startTime();
//akhir jam

//ini deklrasi map
var param = {
    //declare for grafik
    GyroX : 0,
    GyroY : 0,
    GyroZ : 0,
    setgyrox : function(data){
        this.GyroX = parseFloat(data);
    },
    setgyroy : function(data){
        this.GyroY = parseFloat(data);
    },
    setgyroz : function(data){
        this.GyroZ = parseFloat(data);
    },
    getgyrox : function(){
        return this.GyroX;
    },
    getgyroy : function(){
        return this.GyroY;
    },
    getgyroz : function(){
        return this.GyroZ;
    },
    //declare for coordinate
    Latit : -6.9147439,
    Longi : 107.609809875,

    setLatit : function(data){
        this.Latit = parseFloat(data);
    },
    setLongi : function(data){
        this.Longi = parseFloat(data);
    },
    getLatit : function(){
       return this.Latit;
    },
    getLongi : function(){
       return this.Longi  ;
    },
    //decalre for gauge
    // Vspe : 0,
    // Compas : 0,
    // setVspe : function(data){
    //     this.Vspe = parseFloat(data);
    // },
    // setCompas : function(data){
    //     this.Compas = parseFloat(data);
    // },
    // getVspe : function(){
    //     return this.Vspe;
    // },
    // getCompas : function(){
    //     return this.Compas;
    // },
    //declare Apogee
    Apogee : 0,
    setApogee : function(data){
        this.Apogee = parseFloat(data);
    },
    getApogee : function(){
        return this.Apogee;
    }
};
var lineCoordinatesArray = [];
//akhir deklarasi map

function getgyx(){
    for (var i =0; i < totalPoints; ++i){
    GYX.push([i,0]);
    }
    return GYX;
}

function getgyy(){
for (var i = 0; i < totalPoints; ++i){
    GYY.push([i,0]); 
}
    return GYY;
}

function getgyz(){
for(var i = 0; i < totalPoints; ++i){
    GYZ.push([i,0]);
}
    return GYZ;
}

var updateInterval = 0;
var plot = $.plot(
    "#GrafikGyroscope",
    [ 
        {data : getgyx()},
        {data : getgyy()},
        {data : getgyz()}
        // { data : getgyx() , label : "<div align='center' style='color:black; font-size: 8px'>Gyro X</div>" },
        // { data : getgyy() , label : "<div align='center' style='color:black; font-size: 8px'>Gyro Y</div>" },
        // { data : getgyz() , label : "<div align='center' style='color:black; font-size: 8px'>Gyro Z</div>" }
    ],
    {
        series: {
        shadowSize: 0// Drawing is faster without shadows
        },
        yaxis: {
        min: -100,
        max: 100,
        show: false
        },
        xaxis: {
        show: false
        }
    }
);
function updategraph() {
    plot.setData([{data : GYX}, {data : GYY}, {data : GYZ}]);
    plot.draw();
    setTimeout(updategraph, updateInterval);
}
updategraph();

function update(){
    var socket = io.connect();
    socket.on('kirim', function(data){

        //console.log(data);

        Head = parseFloat(data.datahasil[0]);
        Accx = parseFloat(data.datahasil[1]);
        AccY = parseFloat(data.datahasil[2]);
        AccZ = parseFloat(data.datahasil[3]);
        GyroX = parseFloat(data.datahasil[4]);
        GyroY = parseFloat(data.datahasil[5]);
        GyroZ = parseFloat(data.datahasil[6]);
        Baro = parseFloat(data.datahasil[7]);
        Vspe = parseFloat(data.datahasil[8]);
        Compas = parseFloat(data.datahasil[9]);
        Roll = parseFloat(data.datahasil[10]);
        Pitch = parseFloat(data.datahasil[11]);
        Yaw = parseFloat(data.datahasil[12]);
        Dist = parseFloat(data.datahasil[13]);
        Satel = parseFloat(data.datahasil[14]);
        Altit = parseFloat(data.datahasil[15]);
        Latit = parseFloat(data.datahasil[16]); 
        Longi = parseFloat(data.datahasil[17]);
        imgs = data.datahasil[18];//for path of image

        if (Altit < 0) {
            Altit = 0; //No minus in Altitude
        }

        Newaltid = Altit;//apogee
        if(Newaltid >= Tampung){
            Tampung = Newaltid;
            Apogee = Tampung;
        }
        
        //console.log(data);
        totalPointsplot = totalPointsplot + 1;

        box.rotation((Pitch), (360-Compas), (Roll)).update();

        $("#Satellite").html(Satel);
        $("#Dist").html(Dist);
        $("#Vert").html(Vspe);
        $("#Head").html(Head);
        $("#Altit").html(Altit);
        $("#Compas").html(Compas);
        $("#Roll").html(Roll);
        $("#Pitch").html(Pitch);
        $("#Yaw").html(Yaw);
        $("#Apogee").html(Apogee);
        $("#Latit").html(Latit);
        $("#Longi").html(Longi);

        //declare grafik
        param.setgyrox(GyroX);
        param.setgyroy(GyroY);
        param.setgyroz(GyroZ);
        //declare gauge
        // param.setVspe(Vspe);
        // param.setCompas(Compas);
        //declare coordinate
        param.setLatit(Latit);
        param.setLongi(Longi);
        redraw(param.getLatit(), param.getLongi());
        //declare 3d model
        param.setApogee(Apogee);
        gaugecompass.value = Compas;
        gaugekec.value = Vspe;
        gaugeroll.value = Roll;
        gaugepitch.value = Pitch;
        gaugeyaw.value = Yaw;
        // //Push new value to Flot Plot
        GYX.push([totalPoints, GyroX]);
        GYX.shift();
        GYY.push([totalPoints, GyroY]);
        GYY.shift();
        GYZ.push([totalPoints, GyroZ]);
        GYZ.shift();
        for (i=0;i<totalPoints; i++) { 
        GYX[i][0]=i;
        GYY[i][0]=i;
        GYZ[i][0]=i;
        }
    
        //menentukan sesi terbang pakai ketinggian dam apogee
        if(Apogee <= 10){
            document.getElementById("imgss").src="vendor/image/status/SESI1.png";
        }
        else{
            if(Apogee < Altit){
                document.getElementById("imgss").src="vendor/image/status/SESI2.png";
            }else if(Altit < Apogee){
                document.getElementById("imgss").src="vendor/image/status/SESI3.png";
            }
        }
    });
    socket.on('message', function(data){
        pesan = data.datapesan[0];
        validasidata = data.datapesan[1];
        timecek = data.datapesan[2];
        
        document.getElementById("message").innerHTML=pesan;
        if(validasidata == 0){
            clearTimeout(t);
            document.getElementById("aksi").innerHTML = "<button onclick='startSerial()' style='background-color: rgba(0, 0, 0, 0); border-radius: 30px;'><img class='tombol' id='parsing' src='vendor/image/stop.png'></button>";
            document.getElementById("statusparse").innerHTML="parsing off!";
        }else if(validasidata == 1){
            document.getElementById("aksi").innerHTML = "<button onclick='stopSerial();' style='background-color: rgba(0, 0, 0, 0); border-radius: 30px;'><img class='tombol' id='parsing' src='vendor/image/start.png'></button>";
            document.getElementById("statusparse").innerHTML="parsing on!";
        }
    });

    // if(imgs.length >= 1){
    //     var hasilgambar = imgs.length - 1;
    //     document.getElementById("realtimefoto").src="foto/"+imgs[hasilgambar];
    //     // document.getElementById("realtimefoto").src="foto/"+imgs;
    // }

        var hasilgambar = imgs.length - 1;
        document.getElementById("realtimefoto").src="foto/"+imgs[hasilgambar];

    for(i = 0; i < imgs.length; i++)
    {
        document.getElementById("fotoudara").innerHTML +=   "<img style='height: 149.5px; padding: 5px 5px 5px 5px;' class='img-responsive' src='foto/" + imgs[i] + "'>";
    }

    for (var i = 0; i < imgs.length; i++) {
        arrImgs.push({
            src: 'foto/' +imgs[i],
            thumb: 'foto/' +imgs[i]
        });
    }

    $('#gallerys').on('click', function(){ 
        $(this).lightGallery({
            thumbnail:true,
            dynamic: true,
            mode: 'lg-fade',
            dynamicEl: arrImgs
        })
    });

    // //Make map
    var map = new google.maps.Map(document.getElementById('googlemap'), {
        zoom: 15,
        center: {lat: param.getLatit(), lng: param.getLongi(), alt: 0},
        //mapTypeId: 'terrain'
        mapTypeId: 'satellite'
    });
    // //make marker
    map_marker = new google.maps.Marker({position: {lat: param.getLatit(), lng: param.getLongi()}, map: map});
    map_marker.setMap(map);
    function redraw(Latit, Longi) {
      map.setCenter({lat: Latit, lng : Longi, alt: 0}); // biar map ketengah
      map_marker.setPosition({lat: Latit, lng : Longi, alt: 0}); // biar map ketengah
      pushCoordToArray(Latit, Longi); //masukin nilai lintang dan Longi ke array coordinates
      var lineCoordinatesPath = new google.maps.Polyline({
          path: lineCoordinatesArray,
          geodesic: true,
          strokeColor: '#ffeb3b',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        lineCoordinatesPath.setMap(map); 
    }
    function pushCoordToArray(Latitn, lngIn) {
      lineCoordinatesArray.push(new google.maps.LatLng(Latitn, lngIn));
    }
    map.addListener('tilesloaded', function(e) {
        $('.dismissButton').click();
    });
    setInterval(function(){
    $("*").each(function() {
            if ($(this).css("zIndex") == 100) {
                $(this).css("zIndex", "-100");
            }
    })}, 10);
    //akhir map on update()
    //awal gauge
    var w=140;
    var h=140;
    //gauge compass
    var gaugecompass = new RadialGauge({
        renderTo: 'gaugecompass',
        width : w,
        height : h,
        minValue: 0,
        maxValue: 360,
        majorTicks: [
            "N",
            "NE",
            "E",
            "SE",
            "S",
            "SW",
            "W",
            "NW",
            "N"
        ],
        minorTicks: 22,
        ticksAngle: 360,
        startAngle: 180,
        strokeTicks: false,
        highlights: false,
        colorPlate: "rgba(255, 132, 0, 1)",
        colorMajorTicks: "#f5f5f5",
        colorMinorTicks: "rgba(0, 0, 0, 1)",
        colorNumbers: "rgba(0, 0, 0, 1)",
        colorNeedle: "rgba(255, 0, 0, 1)",
        colorNeedleEnd: "rgba(255, 0, 0, 1)",
        valueBox: false,
        valueTextShadow: false,
        colorCircleInner: "#fff",
        colorNeedleCircleOuter: "#ccc",
        needleCircleSize: 15,
        needleCircleOuter: false,
        animationRule: "linear",
        needleType: "line",
        needleStart: 75,
        needleEnd: 99,
        needleWidth: 10,
        borders: true,
        borderInnerWidth: 0,
        borderMiddleWidth: 0,
        borderOuterWidth: 0,
        colorBorderOuter: "#ccc",
        colorBorderOuterEnd: "#ccc",
        colorNeedleShadowDown: "#222",
        borderShadowWidth: 0,
        animationTarget: "plate",
        animationDuration: 1500,
        value: 180,
        animateOnInit: true
    });
    gaugecompass.draw();
    // //gauge kecepatan
    var gaugekec = new RadialGauge({
        renderTo: 'gaugespeed',
        width: w,
        height: h,
        units: "Mph",
        minValue: 0,
        maxValue: 50,
        majorTicks: [
            "0",
            "10",
            "20",
            "30",
            "40",
            "50"
        ],
        minorTicks: 2,
        strokeTicks: true,
        highlights: [
            {
                "from": 40,
                "to": 50,
                "color": "rgba(200, 50, 50, .75)"
            }
        ],
        colorUnits: "black",
        colorPlate: "rgb(255, 132, 0)",
        borderShadowWidth: 0,
        borders: false,
        needleType: "arrow",
        needleWidth: 15,
        needleCircleSize: 7,
        colorNeedle: "rgba(255, 0, 0, 1)",
        colorNeedleEnd: "rgba(255, 0, 0, 1)",
        needleCircleOuter: true,
        needleCircleInner: false,
        animationDuration: 1500,
        animationRule: "linear"
    });
    gaugekec.draw();

    var gaugeroll = new LinearGauge({
        renderTo: 'canvasroll',
        // width: ,
        height: 65,
        minValue: -300,
        maxValue: 300,
        majorTicks: [
            -50,
            -40,
            -30,
            -20,
            -10,
            0,
            10,
            20,
            30,
            40,
            50
        ],
        minorTicks: 5,
        strokeTicks: true,
        ticksWidth: 15,
        ticksWidthMinor: 7.5,
        highlights: [
            {
                "from": -50,
                "to": 0,
                "color": "rgba(0,0, 255, .3)"
            },
            {
                "from": 0,
                "to": 50,
                "color": "rgba(255, 0, 0, .3)"
            }
        ],
        colorMajorTicks: "#ffe66a",
        colorMinorTicks: "#ffe66a",
        colorTitle: "#eee",
        colorUnits: "#ccc",
        colorNumbers: "#eee",
        colorPlate: "rgba(36,101,192,0.4)",
        colorPlateEnd: "rgba(255, 132, 0,0.4)",
        borderShadowWidth: 0,
        borders: false,
        borderRadius: 20,
        needleType: "arrow",
        needleWidth: 3,
        animationDuration: 1500,
        animationRule: "linear",
        colorNeedle: "#222",
        colorNeedleEnd: "",
        colorBarProgress: "rgb(255, 132, 0)",
        colorBar: "#f5f5f5",
        barStroke: 0,
        barWidth: 8,
        barBeginCircle: false
    });
    gaugeroll.draw();

    var gaugepitch = new LinearGauge({
        renderTo: 'canvaspitch',
        // width: ,
        height: 65,
        minValue: -300,
        maxValue: 300,
        majorTicks: [
            -50,
            -40,
            -30,
            -20,
            -10,
            0,
            10,
            20,
            30,
            40,
            50
        ],
        minorTicks: 5,
        strokeTicks: true,
        ticksWidth: 15,
        ticksWidthMinor: 7.5,
        highlights: [
            {
                "from": -50,
                "to": 0,
                "color": "rgba(0,0, 255, .3)"
            },
            {
                "from": 0,
                "to": 50,
                "color": "rgba(255, 0, 0, .3)"
            }
        ],
        colorMajorTicks: "#ffe66a",
        colorMinorTicks: "#ffe66a",
        colorTitle: "#eee",
        colorUnits: "#ccc",
        colorNumbers: "#eee",
        colorPlate: "rgba(36,101,192,0.4)",
        colorPlateEnd: "rgba(255, 132, 0,0.4)",
        borderShadowWidth: 0,
        borders: false,
        borderRadius: 20,
        needleType: "arrow",
        needleWidth: 3,
        animationDuration: 1500,
        animationRule: "linear",
        colorNeedle: "#222",
        colorNeedleEnd: "",
        colorBarProgress: "rgb(255, 132, 0)",
        colorBar: "#f5f5f5",
        barStroke: 0,
        barWidth: 8,
        barBeginCircle: false
    });
    gaugepitch.draw();

    var gaugeyaw = new LinearGauge({
        renderTo: 'canvasyaw',
        // width: ,
        height: 65,
        // units: "°C",
        // title: "Temperature",
        minValue: -300,
        maxValue: 300,
        majorTicks: [
            -50,
            -40,
            -30,
            -20,
            -10,
            0,
            10,
            20,
            30,
            40,
            50
        ],
        minorTicks: 5,
        strokeTicks: true,
        ticksWidth: 15,
        ticksWidthMinor: 7.5,
        highlights: [
            {
                "from": -50,
                "to": 0,
                "color": "rgba(0,0, 255, .3)"
            },
            {
                "from": 0,
                "to": 50,
                "color": "rgba(255, 0, 0, .3)"
            }
        ],
        colorMajorTicks: "#ffe66a",
        colorMinorTicks: "#ffe66a",
        colorTitle: "#eee",
        colorUnits: "#ccc",
        colorNumbers: "#eee",
        colorPlate: "rgba(36,101,192,0.4)",
        colorPlateEnd: "rgba(255, 132, 0,0.4)",
        borderShadowWidth: 0,
        borders: false,
        borderRadius: 20,
        needleType: "arrow",
        needleWidth: 3,
        animationDuration: 1500,
        animationRule: "linear",
        colorNeedle: "#222",
        colorNeedleEnd: "",
        colorBarProgress: "rgb(255, 132, 0)",
        colorBar: "#f5f5f5",
        barStroke: 0,
        barWidth: 8,
        barBeginCircle: false
    });
    gaugeyaw.draw();
}


window.setInterval(function(){
    if(timecek == "true"){
        timer();
    }
}, 15000);

//odometry
var newArray1 = []
var newArray2 = []
var newArray3 = []

for(var i=0;i<totalPointsplot; i++) {
  var x = Latit
  newArray1[i] = x
  totalPointsplot + 1
}
for(var i=0;i<totalPointsplot; i++) {
  var y = Longi
  newArray2[i] = y
  totalPointsplot + 1
}
for(var i=0;i<totalPointsplot; i++) {
  var z = Altit
  newArray3[i] = z
  totalPointsplot + 1
}

var trace1 = {
  x: newArray1,
  y: newArray2,
  z: newArray3,
  mode: 'lines',
  marker: {
    color: '#1f77b4',
    size: 10,
    symbol: 'circle',
    line: {
      color: 'rgb(99,47,173)',
      width: 0
    }
  },
  line: {
    color: 'rgb(255, 132, 0)',
    width: 3
  },
  type: 'scatter3d'
};

var data = [trace1];
var layout = {
    scene:{xaxis: {
        nticks:15,  
        showticklabels:false,
        titlefont: {
            color: 'white'
        },
        title: ' ',
        linecolor: '#636363',
        linewidth: 2
    },
    yaxis: {
        nticks:15,  
        showticklabels:false,
        titlefont: {
            color: 'white'
        },
        title: ' ',
        linecolor: '#636363',
        linewidth: 2
    },
    zaxis: {
        nticks:15,  
        showticklabels:false,
        titlefont: {
            color: 'white'
        },
        title: ' ',
        linecolor: '#636363',
        linewidth: 2
    }},
    width:345,
    height:345,
    autosize: false,
    margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0
    },
    paper_bgcolor :'rgba(0,0,0,0)',
    plot_bgcolor :'rgba(0,0,0,0)'
};

Plotly.newPlot('odometry', data, layout, {showSendToCloud: true}, {responsive: true}); 

var cnt = 0;

var interval = setInterval(function() {

  var x = Latit
  var y = Longi
  var z = Altit
//   var x = GyroX
//   var y = GyroZ
//   var z = GyroY
  newArray1 = newArray1.concat(x)
  newArray1.splice(0, 1)
  newArray2 = newArray2.concat(y)
  newArray2.splice(0, 1)
  newArray3 = newArray3.concat(z)
  newArray3.splice(0, 1)

  var data_update = {
    x: [newArray1],
    y: [newArray2],
    z: [newArray3]
  };

  Plotly.update('odometry', data_update)
  //if(cnt === 100) clearInterval(interval);
}, 1000); 
//end of odometry


//start altitude per distance
var ketinggian = []
var jarak = []
for(var i=0;i<totalPointsplot; i++) {
  var x = Dist
  jarak[i] = x
  totalPointsplot + 1
}
for(var i=0;i<totalPointsplot; i++) {
  var y = Altit
  ketinggian[i] = y
  totalPointsplot + 1
}
var intervals = setInterval(function() {
    var x = Dist
    var y = Altit
    jarak = jarak.concat(x)
    jarak.splice(0, 1)
    ketinggian = ketinggian.concat(y)
    ketinggian.splice(0, 1)
    var data_updates = {
      x: [jarak],
      y: [ketinggian]
    };
    Plotly.update('GrafikJarakAlt', data_updates)
}, 100);

var garis = {
    x: jarak, 
    y: ketinggian, 
    mode: 'lines', 
    name: 'spline', 
    line: {shape: 'spline'}, 
    type: 'scatter'
};
var dataAD = [garis];
var layouts = {
    xaxis: {
        tickfont: {
            size: 8,
            color: 'white'
        },
    },
    yaxis: {
        tickfont: {
            size: 8,
            color: 'white'
        },
    },
    legend: {
    y: 0.5,
    //font: {size: 9, color: 'rgb(255,255,255)'}, 
    yref: 'paper',
    },
    paper_bgcolor :'rgba(0,0,0,0)',
    plot_bgcolor :'rgba(0,0,0,0)',
    margin: {
        l: 20,
        r: 5,
        b: 21,
        t: 0
    },
};
Plotly.newPlot('GrafikJarakAlt', dataAD, layouts, {showSendToCloud: true}, {responsive: true});
//end

var lat1, lon1;

function sethome(){
    var socket = io.connect();
    socket.emit('sethome' , 0);
    // lat1 = Latit;
    // lon1 = Longi;
    // Plotly.deleteTraces(GrafikJarakAlt, [0])
    // Plotly.addTraces(GrafikJarakAlt, dataAD);
    // Plotly.deleteTraces(odometry, [0])
    // Plotly.addTraces(odometry, data); 
}
//button kalibrasi kompas
function compasscalib(){
    var socket = io.connect();
    socket.emit('kalibrasi' , 0);
}

function takePictSerial(){
    var socket = io.connect();
    socket.emit('takePict' , 2);
    hasilnya = 1;
}

function startSerial() {
    //timer();
    var socket = io.connect();
    socket.emit('start', 0);
    lat1 = Latit;
    lon1 = Longi;
}

function stopSerial() {
    validasidata = 0;
    var socket = io.connect();
    socket.emit('stop', 0);
}