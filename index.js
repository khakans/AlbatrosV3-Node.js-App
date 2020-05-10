const SerialPort = require('serialport'); //serialport for connecting alat ke pc
const express = require('express');//web framework untuk node js
const app = express(); //run express on app;
const path = require('path'); //path directory library
var fs = require('fs'); //manage file
const bodyParser = require('body-parser'); //using body parser to easy parsing
const btoa = require('btoa'); // console.log(Buffer.from('Hello World!').toString('base64')); //base64
const comPort = process.argv[2]; //pernyataan kedua : COMport

const moment = require('moment-timezone'); //config timezone
moment().tz("Asia/Bangkok").format();
const waktu = require('moment');
process.env.TZ = 'Asia/Bangkok';

require('events').EventEmitter.defaultMaxListeners = Infinity; //socket.io infinity users
const server = require('http').createServer(app); //create server from express config
const io = require('socket.io').listen(server); //create io.socket to run in server  //data supaya real time

//config express for using json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'www'))); //folder segala macam
app.set('json spaces', 4);//tidy the json code

const portNumber = 3000;
server.listen(portNumber);//start http-server on port

/* my serialport configuration */
const myPort = new SerialPort(comPort, {
	baudRate: 57600,
	databits: 8,
	parity: 'none'
});

const parsers = SerialPort.parsers;
const parser = new parsers.Readline({
	delimiter : '\r\n'
});

myPort.pipe(parser);

//deklarasi variabel
var pesan = "no message" ,
	timecek = "false",
	datahasil , 
	RAWData , 
	jumlahClient = 0 ,
	dcClient = 0 ,
	triggerTakePhoto = false ,
	temp ,
	save = false ,
	valid = false,
	stopped = false,
	lanjutkan = false,
	nomorGambar = 0,
	gambar = '',
	count = 0,
	oneImagePath = '',
	listGambar = [];

var param = {
	head : '', //header team
	accX : 0,
	accY : 0,
	accZ : 0,
	gyrX : 0,
	gyrY : 0,
	gyrZ : 0,
	baro : 0,
	vspe : 0,
	compass : 0,
	roll : 0,
	pitch : 0,
	yaw : 0,
	dist : 0,
	satel : 0,
	altit : 0,
	latit : 0,
	longi : 0,
	imgs : 0,
	imgtime : 0,
	imgaltitude : 0,
	data : function(){
		var getData = moment().format("HH:mm:ss") + "\t" 
			+ this.head + "\t" 
			+ this.accX + "\t" 
			+ this.accY + "\t" 
			+ this.accZ + "\t" 
			+ this.gyrX + "\t"
			+ this.gyrY + "\t"
			+ this.gyrZ + "\t"
			+ this.baro + "\t"
			+ this.vspe + "\t"
			+ this.compass + "\t" 
			+ this.roll + "\t"
			+ this.pitch + "\t"
			+ this.yaw + "\t"
			+ this.dist + "\t"
			+ this.satel + "\t"
			+ this.altit + "\t" 
			+ this.latit + "\t" 
			+ this.longi;

		return getData;
		},
		logFile : function() {
					logger.write(this.data() + '\r\n'); //save log
					//console.log("Save data to log.txt on " + this.ketinggian + " meter" );
					save = true;
		}
		
	// ,dataAdd : function(){
	// 	this.graph.gyrX.push(this.gyrX);
	// 	this.graph.gyrY.push(this.gyrY);
	// 	this.graph.gyrZ.push(this.gyrZ);
  // 	}
};

/*----------  FIle Save  ----------*/
const testFolder = 'www/foto/';
app.get('/listGambar' , function(req , res) {
  	const files = [];
  	fs.readdirSync(testFolder).forEach(file => {
    	files.push(file);
	})
  	res.json({ data: files});
});
/*----------  JSON  ----------*/
// app.get('/data' , function(req , res) {
// res.json({data : param.graph});
// });
  
app.get('/listImage' , function(req , res) {
	res.json({data : listGambar});
});

/*===============================
=            Picture            =
===============================*/
function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}
function simpanGambar(data) {
	//console.log(data);
	//console.log('yang mau diconvert');
	var img = "data:image/png;base64," + hexToBase64(data);
	var data = img.replace(/^data:image\/\w+;base64,/, "");
	//var buf = new Buffer(data, 'base64');
	nomorGambar++;
  	listGambar.push(nomorGambar+'_'+param.imgAltitude+'_'+param.imgTime+'.jpg'); //to save the list
  	fs.writeFile('website/foto/'+nomorGambar+'_'+param.imgAltitude+'_'+param.imgTime+'.jpg', data, 'base64', function(err) {
		console.log(err);
	});
  	oneImagePath = nomorGambar+'_'+param.imgAltitude+'_'+param.imgTime+'.jpg';
}
/*=====  End of Picture  ======*/

// log data save to txt (good use)
const logger = fs.createWriteStream('logger.txt',{
	flags : 'a'
});
logger.write("ALBATROS APTRG---------------------------------------------------------------------------------------------------------------------------------------------------------------" + "\r\n");
logger.write("---------------------------------------------------------------------------------------------------------------------------------------------------------------------------" + "\r\n");
logger.write("Waktu		head	AccX	AccY	AccZ	gyrX	gyrY	gyrZ	baro	Vspe	compass     Roll	Pitch	   Yaw	    Distance    Satelite     Alti	Latitude	Longitude    image" + "\r\n");
logger.write("---------------------------------------------------------------------------------------------------------------------------------------------------------------------------" + "\r\n");

var validasidata = 0;

/*----------------------start main----------------------*/
myPort.on("open", function () {
	console.log("|=======================================|");
	console.log('|        ALBATROS APTRG Started         |');
	console.log("|  Waktu Mulai :", moment().format("MM/DD/YYYY, HH:mm:ss")+'   |');
	console.log('|=======================================|');
	console.log('|Port Open : '+ comPort + ', Server on port : ' + portNumber + '|');
	console.log("|=======================================|");

	let delayMillis = 1500;//DELAY TIME FOR STARTING(1,5s)
	
	parser.on('data',function(data,delimiter){
		RAWData = data.toString();
		RAWData = RAWData.replace(/(\r\n|\n|\r)/gm,"");//word replacer to simply parsing
		datahasil = RAWData.split(',');//split the data with ','
		
		validasidata = 1;
		//console.log("panjang data : ", datahasil.length);
		param.logFile();//command to save the data in log file;
		stopped = false;
		if (datahasil.length == 19) {
			if (datahasil[0] == "0DH") {
				if(datahasil[16] != "********** " || datahasil[17] != "*********** "){
					valid = true;
					console.log(data);
					timecek = "true";
					param.head = parseFloat(datahasil[0]);
					param.accX = parseFloat(datahasil[1]);
					param.accY = parseFloat(datahasil[2]);
					param.accZ = parseFloat(datahasil[3]);
					param.gyrX = parseFloat(datahasil[4]);
					param.gyrY = parseFloat(datahasil[5]);
					param.gyrZ = parseFloat(datahasil[6]);
					param.baro = parseFloat(datahasil[7]);
					param.vspe = parseFloat(datahasil[8]);
					param.compass = parseFloat(datahasil[9]);
					param.roll = parseFloat(datahasil[10]);
					param.pitch = parseFloat(datahasil[11]);
					param.yaw = parseFloat(datahasil[12]);
					param.dist = parseFloat(datahasil[13]);
					param.satel = parseFloat(datahasil[14]);
					param.altit = parseFloat(datahasil[15]);
					param.latit = parseFloat(datahasil[16]); 
					param.longi = parseFloat(datahasil[17]);
					if ((datahasil[18] != "IMG") && (datahasil[18] != "")){
						// check first img data contains FFD8?
						pesan = "capturing img...";
						if ((datahasil[18].indexOf("FFD8") >= 0) && (count == 0)) {
							lanjutkan = true;
							param.imgTime = moment().format("HHmmss");
							param.imgAltitude = param.altit;
						}
						// first appear sesuai
						if (lanjutkan == true){
							//tampung gambar
							gambar = gambar + datahasil[18];
						}
						//console.log(count);
						count++;
						// check akhir string ada FFD9 (akhir dari JPEG)
						if (datahasil[18].slice(-4) == "FFD9") {
							pesan = "saving image...";
							simpanGambar(gambar);
							lanjutkan = false; //set ke false lanjutkan biar ngecek lagi pas pertama
							count = 0;
							gambar = ''; //set ke kosong lagi
							pesan = "image saved!";
						}
					}
					//param.logFile(); // command to save the data in log file;
					stopped = false;
				}
			}else if (datahasil[0] != "007") {
				stopped = true;
			}
		}
		else{
			valid = false;
		}
	});

	//io.socket main communication
	io.on('connection' , function(socket){
		jumlahClient++;
		// get data from arduino
		// call again to get event send it to socket io
		parser.on('data', function(data) {
			// send as a JSON
			socket.emit('kirim', {
				datahasil : [
					param.head,
					param.accX,
					param.accY,
					param.accZ,
					param.gyrX,
					param.gyrY,
					param.gyrZ,
					param.baro,
					param.vspe,
					param.compass,
					param.roll,
					param.pitch,
					param.yaw,
					param.dist,
					param.satel,
					param.altit,
					param.latit,
					param.longi,
					oneImagePath // path gambar in here
				]
			},
			// console.log(datahasil[]);
			);  

			socket.emit('message', { 
				datapesan : [
					pesan,
					validasidata,
					timecek
				]
			});
			/*socket.emit('dataCoordinate', {  
			  data : [ 
				param.latit,
				param.longi
			  ]
			});*/
  
		});
		
		socket.on('start', function(data){
			setTimeout(function() {
				myPort.write("1", function(err) {
					if (err) {
						  return console.log('Error on write: ', err.message);
					}
				});
				console.log("TULIS 1 SUKSES");
			}, delayMillis);
		});

		socket.on('takePict', function(data){
			myPort.write('3');
			console.log("TULIS 3 SUKSES");
		});

		socket.on('kalibrasi', function(data){
			myPort.write('k');
			console.log("TULIS K SUKSES");
		});

		socket.on('sethome', function(data){
			myPort.write('2');
			console.log("TULIS 2 SUKSES");
		});

		socket.on('stop' , (data) => {
				validasidata = 0;
				myPort.write("x", function(err) {
					if (err) {
						  return console.log('Error on write: ', err.message);
					}
				});
				console.log("TULIS X SUKSES");
		});

		socket.on('disconnect' , function() {
			dcClient++;
			console.log('1 client disconnected , Total : ' + dcClient);
			jumlahClient--;
			console.log('Number of Client : ' + jumlahClient);
		});
	});

});

//parser.on('data', console.log);

/*------------Akhir Main-----------*/