var fs = require('fs');
var xml2js = require('xml2js');


var parser = new xml2js.Parser();
fs.readFile(process.argv[2], function(err, data) {
  parser.parseString(data, function(err, xml) {
    console.dir(xml);
  });
});

