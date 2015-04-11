var noble = require('noble');
var fs = require('fs');
var express = require('express');
var app = express();

noble.startScanning([], false); // any service UUID, don't allow duplicates

noble.on('discover', function(peripheral) {
  //only find peripheral with an advertisiment named Dan's BLE   //not secure
  // console.log(peripheral.advertisement.localName);
  if (peripheral.advertisement.localName == "Wand") {        
      wandLogger(peripheral);
  }else if (peripheral.advertisement.localName == "Light1"){
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
  onOff: 0,
  status: 0
}



if (light.peripheral && wand.peripheral){
  console.log("are we hooked up? ya, we're hooked up.");
}

app.get('/data', function(req, res){
  res.send(JSON.stringify(data));
  res.end();
});



var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('Example app listening at http://%s:%s', host, port)
})

var wandLogger = function(peripheral){
  peripheral.connect(function(error) {
          console.log('connected to peripheral: ' + peripheral.uuid);
        //find specific "fff0" service which is my Pot Serivce
          wand.peripheral = peripheral;
          peripheral.discoverServices(['fff1','fff4'], function(error, services) {
              var lightControlService = services[0];
              var statusService = services[1];
              console.log('discovered LightControl and Status service');
              lightControlService.discoverCharacteristics(['fff2','fff3'], function(error, characteristics) {
                    var colorCharacteristic = characteristics[0];
                    var onOffCharacteristic = characteristics[1];
                    colorCharacteristic.on('read', function(data, isNotification) {
                      console.log('Hue is ', data.readUInt8(0));
                      console.log('Brightness is ', data.readUInt8(1));
                      wand.hue= data.readUInt8(0);
                      wand.bri= data.readUInt8(1);
                    });
                    colorCharacteristic.notify(true, function(error) {
                      console.log('Color notification on');
                    });
                    onOffCharacteristic.on('read', function(data, isNotification) {
                      console.log('OnOff: ', data.readUInt8(0));
                      wand.onOff= data.readUInt8(0);
                    });
                    onOffCharacteristic.notify(true, function(error) {
                      console.log('OnOff notification on');
                    });
              }); 
              statusService.discoverCharacteristics(['fff5'], function(error, characteristics) {
                  var statusCharacteristic = characteristics[0];
                   statusCharacteristic.on('read', function(data, isNotification) {
                      console.log('Status is: ', data.readUInt8(0));
                      wand.status = data.readUInt8(0);
                  });
                     statusCharacteristic.notify(true, function(error) {
                      console.log('Status notification on');
                    });

          });
      });
  });
}
