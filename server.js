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
   // console.log(peripheral);
  if (peripheral.uuid== "0786e7fa25024e4eb77505b43beec332") {  

  // if (peripheral.advertisement.localName == "Wand") {  
      console.log("wand found");
      wandLogger(peripheral);

  }
  if (peripheral.uuid== "077c7436c40e44ff8f530873ab7067fe") {  

  // if (peripheral.advertisement.localName == "Arduino"){
    console.log("light found");
      lightLogger(peripheral);
  }
});

var light = {
  peripheral: null,
  hue: 0,
  bightness: 0,
  onOff: 0,
  status: 0
}

var wand = {
  peripheral: null,
  hue: 0,
  bightness: 0,
  onOff: 0,   //do we need this
  status: 0
}

function d2h(d) { return "0x"+ (+d).toString(16).toUpperCase(); }

var doIt = function(){
  if (light.peripheral && wand.peripheral){
    // console.log("are we hooked up? ya, we're hooked up.");
    if (light.status == 1){   //light.status gets set from laser triggering photo resistor
        // // write wand.status = 1; // wand buzzes  //SYNC is DONE
        // tempBuffer = new Buffer([1]);
        // wand.peripheral.statusService.statusCharacteristic.write(tempBuffer, false, function(error) {
        //     console.log('set wand status to ready');
        // });
        var briBuffer = new Buffer(1);
        // briBuffer[0] = d2h(wand.brightness);
        // console.log(d2h(wand.brightness));
         briBuffer.writeUInt8(d2h(wand.brightness),0);
        // console.log(briBuffer);
        light.peripheral.lightControlService.briCharacteristic.write(briBuffer, false, function(error) {
            // console.log(briBuffer);
          });
       var hueBuffer = new Buffer(1);
       hueBuffer.writeUInt8(d2h(wand.hue),0);
       // console.log(hueBuffer);
         light.peripheral.lightControlService.hueCharacteristic.write(hueBuffer, false, function(error) {
            // console.log(hueBuffer);
          });
        // set timeout on wand if no new values are sent/. timeout.sends disconnectmessage. aka stat
      if (wand.status == 0 ){ // really if light.status changes from 1 to 0
          var tempBuffer = new Buffer(1);
          tempBuffer.writeUInt8(d2h(1),0);
          wand.peripheral.statusService.statusCharacteristic.write(tempBuffer, false, function(error) {
            // console.log(hueBuffer);
        });
    }
    }
  }
}
var doIt2 = function(){
  if (light.peripheral && wand.peripheral){
    // console.log("are we hooked up? ya, we're hooked up.");
    if (light.status == 1){ 
       // if (wand.status == 0 ){ // really if light.status changes from 1 to 0
          var tempBuffer = new Buffer(1);
          tempBuffer.writeUInt8(d2h(1),0);
          wand.peripheral.statusService.statusCharacteristic.write(tempBuffer, false, function(error) {
            console.log("writing wand status");
            });
    }else{
      var tempBuffer = new Buffer(1);
          tempBuffer.writeUInt8(d2h(0),0);
          wand.peripheral.statusService.statusCharacteristic.write(tempBuffer, false, function(error) {
            console.log("writing wand status");
          });
    }
  }
}

// // app.get('/data', function(req, res){
//   res.send(JSON.stringify(data));
//   res.end();
// });

// setInterval(doIt, 50);

var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('Example app listening at http://%s:%s', host, port)
})

var wandLogger = function(peripheral){

    peripheral.connect(function(error) {
      console.log(error);
          console.log('connected to peripheral: ' + peripheral.uuid);
        //find specific "fff0" service which is my Pot Serivce
          wand.peripheral = peripheral;
          peripheral.discoverServices(['fff1','fff5'], function(error, services) {
              var lightControlService = services[0];
              wand.peripheral.lightControlService = lightControlService;
              var statusService = services[1];
              wand.peripheral.statusService = statusService;
              console.log('discovered LightControl and Status service');
              lightControlService.discoverCharacteristics(['fff2','fff3','fff4'], function(error, characteristics) {
                    var briCharacteristic = characteristics[0];
                    var hueCharacteristic = characteristics[1];
                    var onOffCharacteristic = characteristics[2];
                    briCharacteristic.on('read', function(data, isNotification) {
                      console.log('Hue is ', data.readUInt8(0));
                      wand.brightness= data.readUInt8(0);
                      doIt();
                    });
                    briCharacteristic.notify(true, function(error) {
                      console.log('Color notification on');
                    });
                    hueCharacteristic.on('read', function(data, isNotification) {
                      console.log('Bri is ', data.readUInt8(0));
                      wand.hue= data.readUInt8(0);
                       doIt();
                    });
                    hueCharacteristic.notify(true, function(error) {
                      console.log('Hue notification on');
                    });
                    onOffCharacteristic.on('read', function(data, isNotification) {
                      console.log('OnOff: ', data.readUInt8(0));
                      wand.onOff= data.readUInt8(0);
                    });
                    onOffCharacteristic.notify(true, function(error) {
                      console.log('OnOff notification on');
                    });
              }); 
        wand.peripheral.statusService = statusService;
              statusService.discoverCharacteristics(['fff6'], function(error, characteristics) {
                  var statusCharacteristic = characteristics[0];
                    wand.peripheral.statusService.statusCharacteristic = statusCharacteristic;

                   statusCharacteristic.on('read', function(data, isNotification) {
                      console.log('Status is: ', data.readUInt8(0));
                      wand.status = data.readUInt8(0);
                  });
                     statusCharacteristic.notify(true, function(error) {
                      console.log('Status notification on');
                    });

              });
              peripheral.on('disconnect', function(){
                  console.log(" wand is disconnected");
                  wand.peripheral = null;
              })
      });
  });
}

var lightLogger = function(peripheral){
  peripheral.connect(function(error) {
          console.log('connected to peripheral: ' + peripheral.uuid);
        //find specific "fff0" service which is my Pot Serivce
          light.peripheral = peripheral;
          peripheral.discoverServices(['fff1','fff5'], function(error, services) {
              var lightControlService = services[0];
              light.peripheral.lightControlService = lightControlService;
              var statusService = services[1];
             light.peripheral.statusService = statusService;
              console.log('discovered LightControl and Status service');
              lightControlService.discoverCharacteristics(['fff2','fff3','fff4'], function(error, characteristics) {
                    var briCharacteristic = characteristics[0];
                    light.peripheral.lightControlService.briCharacteristic = briCharacteristic;
                      var hueCharacteristic = characteristics[1];

                      light.peripheral.lightControlService.hueCharacteristic = hueCharacteristic;

                    var onOffCharacteristic = characteristics[2];
                    onOffCharacteristic.on('read', function(data, isNotification) {
                      console.log('OnOff: ', data.readUInt8(0));
                      wand.onOff= data.readUInt8(0);
                    });
                    onOffCharacteristic.notify(true, function(error) {
                      console.log('OnOff notification on');
                    });
              }); 
              statusService.discoverCharacteristics(['fff6'], function(error, characteristics) {
                  var statusCharacteristic = characteristics[0];
                   statusCharacteristic.on('read', function(data, isNotification) {
                      console.log('Status is: ', data.readUInt8(0));
                      light.status = data.readUInt8(0);
                      doIt2();
                  });
                     statusCharacteristic.notify(true, function(error) {
                      console.log('Status notification on');
                    });

              });
              peripheral.on('disconnect', function(){
                  console.log(" wand is disconnected");
                  light.peripheral = null;
              })
      });
  });
}

