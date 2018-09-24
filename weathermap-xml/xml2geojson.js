var fs = require('fs');
var xml2js = require('xml2js');
var turf = require('turf');

var file = process.argv[2];

var parser = new xml2js.Parser();
fs.readFile(file, function(err, data) {
  parser.parseString(data, function(err, xml) {
    console.dir(xml);
    var geojson = parseXML(xml);

    var filename = file.split('.')[0] + '.geojson';
    fs.writeFileSync(filename, JSON.stringify(geojson));
  });
});

function parseXML(xml) {
  var infos = xml.Report.Body[0].MeteorologicalInfos;
  console.dir(infos[0].MeteorologicalInfo[0].DateTime);

  var collection = [];

  for(var item of infos[0].MeteorologicalInfo[0].Item) {
    var property = item.Kind[0].Property[0];
    console.log(property.Type);
    if (property.Type == '等圧線'){
      collection.push(isobar(property));
    
    }else if (property.Type == '台風'){

    }else if (property.CenterPart){ // 低気圧 高気圧
      collection.push(disturbance(property));
    
    }else if (property.CoordinatePart){ // 前線
      collection.push(front(property));
    }

    //TODO: 悪天情報
  }

  return turf.featureCollection([collection[0]]);
}


function isobar(property) {
  var part = property.IsobarPart[0];
  var pressure = parseInt(part['jmx_eb:Pressure'][0]._);
  var coords = line(part['jmx_eb:Line']);

  return turf.lineString(coords, {type: 'isobar', pressure});
}


function disturbance(property) {
  var type = property.Type[0];
  var part = property.CenterPart[0];

  var coord = coordinate(part['jmx_eb:Coordinate']);
  var pressure = parseInt(part['jmx_eb:Pressure'][0]._);
  var direction = parseInt(part['jmx_eb:Direction'][0]._);
  var speed = part['jmx_eb:Speed'][0].$.description;

  return turf.point(coord, {type, pressure, direction, speed});
}


function front(property) {
  var type = property.Type[0];
  var part = property.CoordinatePart[0];
  var coords = line(part['jmx_eb:Line']);
  var condition = part['jmx_eb:Line'][0].$.condition;

  return turf.lineString(coords, {type, condition});
}


function coordinate(jmx) {
  var d = jmx[0]._.split(/[\/\+]/);
  return [parseFloat(d[2]), parseFloat(d[1])]; // lng, lat
}

function line(jmx) {
  var coords = jmx[0]._.split('/');
  coords.splice(-1);
  return coords.map(function(elem) {
    var d = elem.split('+');
    return [parseFloat(d[2]), parseFloat(d[1])]; // lng, lat
  });
}



