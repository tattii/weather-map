const request = require('request');
const xml2js = require('xml2js');

const {PubSub} = require('@google-cloud/pubsub');
const {Storage} = require('@google-cloud/storage');
const bucketName = 'weather-map';

const xml2geojson = require('./xml2geojson');


exports.handler = (event, context) => {
  const pubsubMessage = event.data;
  const message = JSON.parse(Buffer.from(pubsubMessage, 'base64').toString());
  console.log(message);
  process(message.url);
};

if (require.main === module) {
  const url = process.argv[2];
  processXML(url);
}

function processXML(url) {
  request(url, (err, res, data) => {
    
    const parser = new xml2js.Parser();
    parser.parseString(data, (err, xml) => {
      if (xml.Report.Control[0].Status[0] != '通常') return;

      const geojson = xml2geojson.parseXML(xml);
      console.log(geojson);
    });
  });
}



// weather-map.json
// {
//   current: {
//     file: "*.geojson",
//     datetime: ""
//   },
//   forecast: {
//     24h: { file, datetime },
//     48h: { file, datetime }
//   },
//   past: [
//     { file, datetime },
//     ...
//   ],
// }

async function uploadPublic(filename, data) {
  const storage = new Storage();
  const file = await storage.bucket(bucketName).file(filename);
  file.save(JSON.stringify(data), {
    contentType: 'application/json',
    gzip: true,
    matadata: {
      cacheControl: 'no-cache'
    }
  }, function (err) { 
    if (err) return console.error(err);
    file.makePublic();
  });
}
