var noble = require('noble');
var fs = require('fs');
var express = require('express');
var app = express();

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  if (peripheral.uuid== "832d395f1eb44c69ab371355305ff39f") {  
//832d395f1eb44c69ab371355305ff39f
// console.log(peripheral.advertisement.localName);
// console.log(peripheral.uuid)
// ;   if (peripheral.advertisement.localName == "wand") {  
      console.log("wand found");
      wandLogger(peripheral);

  }
// 2ce2f1dfb7bf4027b84f2fc29ad24294

  if (peripheral.uuid== "0786e7fa25024e4eb77505b43beec332") {  

  // if (peripheral.advertisement.localName == "Arduino"){
    console.log("light1 found");
      lightLogger(peripheral,0);
  }
  // for light2
  //  if (peripheral.uuid== "0786e7fa25024e4eb77505b43beec332") {  

  // // if (peripheral.advertisement.localName == "Arduino"){
  //   console.log("light2 found");
  //     lightLogger(peripheral,1);
  // }
});

var lights =[{
  peripheral: null,
  hue: 0,
  bri: 0,
  onOff: 0,
  status: 1
}]

var wand = {
  peripheral: null,
  hue: 0,
  bri: 0,
  onOff: 0,   //do we need this
  status: 1
}

function d2h(d) { return "0x"+ (+d).toString(16).toUpperCase(); }

var writeBri = function(){
  for (var i = 0; i<lights.length; i++){
    if (lights[i].peripheral && wand.peripheral){
      if (lights[i].status == 1){
        var briBuffer = new Buffer(1);
        briBuffer.writeUInt8(d2h(wand.bri),0);
        lights[i].peripheral.lightControlService.briCharacteristic.write(briBuffer, false, function(error) {
          // console.log(briBuffer);
        });
      }
    }
  }
}

var writeHue = function(){
  for (var i = 0; i<lights.length; i++){
   if (lights[i].peripheral && wand.peripheral){
      if (lights[i].status == 1){  
        var hueBuffer = new Buffer(1);
        hueBuffer.writeUInt8(d2h(wand.hue),0);
        lights[i].peripheral.lightControlService.hueCharacteristic.write(hueBuffer, false, function(error) {
              // console.log(hueBuffer);
        });
      }
    }
  }
}
var writeOnOff = function(){
  for (var i = 0; i<lights.length; i++){
   if (lights[i].peripheral && wand.peripheral){
      if (lights[i].status == 1){  
        var hueBuffer = new Buffer(1);
        hueBuffer.writeUInt8(d2h(wand.hue),0);
        lights[i].peripheral.lightControlService.hueCharacteristic.write(hueBuffer, false, function(error) {
              // console.log(hueBuffer);
        });
      }
    }
  }
}

var writeToWandStatus = function(){
  for (var i = 0; i<lights.length; i++){
    if (lights[i].peripheral && wand.peripheral){
            var tempBuffer = new Buffer(1);
            tempBuffer.writeUInt8(d2h(lights[i].status),0);
            wand.peripheral.statusService.statusCharacteristic.write(tempBuffer, false, function(error) {
              console.log("writing wand status");
              });
    }
  }
}

var writeToLightStatus = function(){
  for (var i = 0; i<lights.length; i++){
    if (lights[i].peripheral && wand.peripheral){
      if (lights[i].status == 1){ 
            light[i].status = 0;
            var tempBuffer = new Buffer(1);
            tempBuffer.writeUInt8(d2h(wand.status),0);
            lights[i].peripheral.statusService.statusCharacteristic.write(tempBuffer, false, function(error) {
              console.log("writing wand status");
            });
        }
    }
  }
}

 app.get('/data', function(req, res){
  // res.send(JSON.stringify(wand));
  console.log(wand);
  console.log(lights);
  res.end();
});

app.get('/write', function(req, res){
  for (var i = 0; i<lights.length; i++){
    var tempBuffer = new Buffer(1);
    tempBuffer.writeUInt8(d2h(0),0);
    wand.peripheral.lightControlService.statusCharacteristic.write(tempBuffer, false, function(error) {
      console.log("writing wand status");
    });
  }
  res.end();
});

// setInterval(doIt, 50);

var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('Example app listening at http://%s:%s', host, port)
})

var wandLogger = function(peripheral){

    peripheral.connect(function(error) {
          // console.log('connected to peripheral: ' + peripheral.uuid);
        //find specific "fff0" service which is my Pot Serivce
          wand.peripheral = peripheral;
          // console.log(peripheral);

          peripheral.discoverServices([], function(error, services) {
             // 
             // console.log(services[0])
              lightControlService = services[0];
              wand.peripheral.lightControlService = lightControlService;
        //       var statusService = services[1];
        //       wand.peripheral.statusService = statusService;
              console.log('discovered Wand Light service');
              lightControlService.discoverCharacteristics([], function(error, characteristics) {
                    var hueCharacteristic = characteristics[0];
                    var onOffCharacteristic = characteristics[1];
                    var statusCharacteristic = characteristics[2];
                    var briCharacteristic = characteristics[3];
                    wand.peripheral.lightControlService.statusCharacteristic = statusCharacteristic;
                    hueCharacteristic.on('read', function(data, isNotification) {
                      console.log('Hue is ', data.readUInt8(0));
                      wand.hue= data.readUInt8(0);
                      writeHue();
                    });
                    hueCharacteristic.notify(true, function(error) {
                      // console.log('Hue notification on');
                    });
                    onOffCharacteristic.on('read', function(data, isNotification) {
                      console.log('OnOff: ', data.readUInt8(0));
                      wand.onOff= data.readUInt8(0);
                      writeOnOff();
                    });
                    onOffCharacteristic.notify(true, function(error) {
                      console.log('OnOff notification on');
                    });
                     briCharacteristic.on('read', function(data, isNotification) {
                      console.log('Bri is ', data.readUInt8(0));
                      wand.bri= data.readUInt8(0);
                      writeBri();
                    });
                    briCharacteristic.notify(true, function(error) {
                      // console.log('Hue notification on');
                    });
                    statusCharacteristic.on('read', function(data, isNotification) {
                      console.log('Status is ', data.readUInt8(0));
                      wand.status= data.readUInt8(0);
                      writeToLightStatus();
                    });
                    statusCharacteristic.notify(true, function(error) {
                      console.log('Status notification on');
                    });

              });
              peripheral.on('disconnect', function(){
                  console.log(" wand is disconnected");
                  wand.peripheral = null;
                  noble.startScanning([ "832d395f1eb44c69ab371355305ff39f"], false);
              })

      });
  });
}

var lightLogger = function(peripheral,i){
  peripheral.connect(function(error) {
          console.log('connected to peripheral: ' + peripheral.uuid);
        //find specific "fff0" service which is my Pot Serivce
          lights[i].peripheral = peripheral;
          peripheral.discoverServices(['fff1','fff5'], function(error, services) {
            // console.log(services)
              var lightControlService = services[0];
              lights[i].peripheral.lightControlService = lightControlService;
              var statusService = services[1];
              lights[i].peripheral.statusService = statusService;
              console.log('discovered LightControl and Status service');
              lightControlService.discoverCharacteristics(['fff2','fff3','fff4'], function(error, characteristics) {
                    var hueCharacteristic = characteristics[0];
                    lights[i].peripheral.lightControlService.hueCharacteristic = hueCharacteristic;
                    var onOffCharacteristic = characteristics[1];
                    lights[i].peripheral.lightControlService.onOffCharacteristic = onOffCharacteristic;
                    var briCharacteristic = characteristics[2];
                    lights[i].peripheral.lightControlService.briCharacteristic = briCharacteristic;
             
              }); 
              statusService.discoverCharacteristics(['fff6'], function(error, characteristics) {
                  var statusCharacteristic = characteristics[0];
                   statusCharacteristic.on('read', function(data, isNotification) {
                      console.log('Status is: ', data.readUInt8(0));
                      lights[i].status = data.readUInt8(0);
                      writeToWandStatus();
                  });
                     statusCharacteristic.notify(true, function(error) {
                      console.log('Status notification on');
                    });
              });
              peripheral.on('disconnect', function(){
                  console.log("light is disconnected");
                  lights[i].peripheral = null;
                  noble.startScanning([ "0786e7fa25024e4eb77505b43beec332"], false);
              })
      });
  });
}

