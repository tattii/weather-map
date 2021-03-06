var fs = require('fs');
var xml2js = require('xml2js');
var turf = require('turf');



if (require.main === module) {
  var file = process.argv[2];
  processFile(file);
}

function processFile(file) {
  var parser = new xml2js.Parser();
  fs.readFile(file, function(err, data) {
    parser.parseString(data, function(err, xml) {
      console.dir(xml);
      if (xml.Report.Control[0].Status[0] != '通常') return;

      var geojson = parseXML(xml);

      var filename = file.split('.')[0] + '.geojson';
      fs.writeFileSync(filename, JSON.stringify(geojson));
    });
  });
}

function parseXML(xml) {
  var infos = xml.Report.Body[0].MeteorologicalInfos;
  var collection = [];

  for(var item of infos[0].MeteorologicalInfo[0].Item) {
    var property = item.Kind[0].Property[0];

    if (property.Type == '等圧線'){
      collection.push(isobar(property));
    
    }else if (property.Type == '台風'){
      collection.push(typhoon(item));

    }else if (property.CenterPart){ // 低気圧 高気圧
      collection.push(disturbance(property));
    
    }else if (property.CoordinatePart){ // 前線
      collection.push(front(property));
    }

    //TODO: 悪天情報
  }

  var geojson = turf.featureCollection(collection);
  
  var head = xml.Report.Head[0];
  var title = head.Title[0]
  var report_datetime = head.ReportDateTime[0];

  var time = infos[0].MeteorologicalInfo[0].DateTime[0];
  var datetime = time._;
  var datetime_type = time.$.type;
  
  geojson.meta = {title, report_datetime, datetime, datetime_type};
  return geojson;
}


function isobar(property) {
  var part = property.IsobarPart[0];
  var pressure = parseInt(part['jmx_eb:Pressure'][0]._);
  var coords = line(part['jmx_eb:Line']);

  return turf.lineString(coords, {type: 'isobar', pressure});
}


function typhoon(item) {
  for (var kind of item.Kind){
    var property = kind.Property[0];
    if (property.CenterPart){
      var {coord, ...center} = centerPart(property.CenterPart[0]);

    }else if (property.WindSpeedPart){
      var windSpeed = windSpeedPart(property.WindSpeedPart[0]);

    }else if (property.TyphoonNamePart){
      var name = typhoonNamePart(property.TyphoonNamePart[0]);

    }else if (property.ClassPart){
      var typhoonClass = classPart(property.ClassPart[0]);
    }
  }

  return turf.point(coord, {center, windSpeed, name, typhoonClass});
}

function centerPart(part) {
  var coord = coordinate(part['jmx_eb:Coordinate']);
  var pressure = parseInt(part['jmx_eb:Pressure'][0]._);
  var direction = parseInt(part['jmx_eb:Direction'][0]._);
  var speed = part['jmx_eb:Speed'][0]._;
  var speed_unit = part['jmx_eb:Speed'][0].$.unit;
  var speed_str = part['jmx_eb:Speed'][0].$.description;

  return {coord, pressure, direction, speed, speed_unit, speed_str};
}

function windSpeedPart(part) {
  var speed = part['jmx_eb:WindSpeed'][0]._;
  var unit = part['jmx_eb:WindSpeed'][0].$.unit;
  return {speed, unit};
}

function typhoonNamePart(part) {
  var name = part.Name[0];
  var name_jp = part.NameKana[0];
  var number = part.Number[0];
  return {name, name_jp, number};
}

function classPart(part) {
  return part['jmx_eb:TyphoonClass'][0]._;
}


function disturbance(property) {
  var type = property.Type[0];
  var {coord, ...part} = centerPart(property.CenterPart[0]);

  return turf.point(coord, {type, ...part});
}


function front(property) {
  var type = property.Type[0];
  var part = property.CoordinatePart[0];
  var coords = line(part['jmx_eb:Line']);
  var condition = part['jmx_eb:Line'][0].$.condition;

  return turf.lineString(coords, {type, condition});
}


function coordinate(jmx) {
  var d = jmx[0]._.split('/')[0];
  return parseCoord(d);
}

function line(jmx) {
  var coords = jmx[0]._.split('/');
  coords.splice(-1);
  return coords.map(function(d) {
    return parseCoord(d);
  });
}

function parseCoord(d) {
  var lat = parseFloat(d.substr(0, 6));
  var lng = parseFloat(d.substr(6, 7));
  if (lng < 0) lng += 360;
  return [lng, lat];
}


module.exports = {
  parseXML
};

