var fs = require('fs');
var xml2js = require('xml2js');
var turf = require('turf');


var parser = new xml2js.Parser();
fs.readFile(process.argv[2], function(err, data) {
  parser.parseString(data, function(err, xml) {
    console.dir(xml);
    parseXML(xml);
  });
});

function parseXML(xml) {
  var infos = xml.Report.Body[0].MeteorologicalInfos;
  console.dir(infos[0].MeteorologicalInfo[0].DateTime);

  var collection = [];

  for(var item of infos[0].MeteorologicalInfo[0].Item) {
    var property = item.Kind[0].Property[0];
    if (property.Type == '等圧線'){
      collection.push(isobar(property));
    }
  }
}

function isobar(property) {
  var part = property.IsobarPart[0];
  var pressure = parseInt(part['jmx_eb:Pressure'][0]._);

  var line = part['jmx_eb:Line'][0]._;

  var coords = line.split('/').map(function(elem) {
    var d = elem.split('+');
    if (d[2]) return [parseFloat(d[2]), parseFloat(d[1])]; // lng, lat
  });

  return turf.lineString(coords, {type: 'isobar', pressure: pressure});
}
