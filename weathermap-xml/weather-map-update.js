const request = require('request');
const xml2js = require('xml2js');
const moment = require('moment');

const {Storage} = require('@google-cloud/storage');
const projectId = 'weatherbox-217409';
const bucketName = 'weather-map';
const bucketUrl = 'https://storage.googleapis.com/weather-map/';
const indexJSON = 'weather-map.json';

const xml2geojson = require('./xml2geojson');


exports.handler = (event, context) => {
  const pubsubMessage = event.data;
  const message = JSON.parse(Buffer.from(pubsubMessage, 'base64').toString());
  console.log(message);
  processXML(message.url);
};

if (require.main === module) {
  const url = process.argv[2];
  processXML(url);
}

function processXML(url) {
  request(url, (err, res, data) => {
    
    const parser = new xml2js.Parser();
    parser.parseString(data, async (err, xml) => {
      if (xml.Report.Control[0].Status[0] != '通常') return;

      const geojson = xml2geojson.parseXML(xml);
      const filename = getFilename(geojson.meta);
      console.log(filename, geojson);
      await uploadPublic(filename, geojson);

      await updateIndexJSON(geojson.meta, filename);
    });
  });
}

function getFilename(meta) {
  const datetime = moment(meta.datetime).format('YYYYMMDDHHmm');
  const type = {
    '地上実況図': 'analysis',
    '地上２４時間予想図': 'forecast/24h',
    '地上４８時間予想図': 'forecast/48h',
  };
  return type[meta.title] + '/' + datetime + '.geojson';
}


// weather-map.json
// {
//   analysis: [
//     { url, datetime },
//     ... (3 days)
//   ],
//   forecast: {
//     24h: { url, datetime },
//     48h: { url, datetime }
//   }
// }

async function updateIndexJSON(meta, filename) {
  const index = await getJSON(indexJSON);

  const file = {
    url: bucketUrl + filename,
    datetime: meta.datetime
  };
  if (!index.forecast) index.forecast = {};

  if (meta.title == '地上実況図') {
    let analysis = index.analysis || [];
    analysis.unshift(file);
    index.analysis = analysis.slice(0, 7 * 3); // 7/day * 3days

  } else if (meta.title == '地上２４時間予想図') {
    index.forecast['24h'] = file;

  } else if (meta.title == '地上４８時間予想図') {
    index.forecast['48h'] = file;
  }

  console.log(index);
  uploadPublic(indexJSON, index);
}

async function getJSON(filename) {
  const storage = new Storage({ projectId });
  const file = await storage.bucket(bucketName).file(filename);
  const exists = await file.exists();
  if (!exists[0]) return {};

  const data = await file.download();
  return JSON.parse(data);
}

async function uploadPublic(filename, data) {
  const storage = new Storage({ projectId });
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
