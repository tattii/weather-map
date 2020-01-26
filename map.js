mapboxgl.accessToken = 'pk.eyJ1IjoidGF0dGlpIiwiYSI6ImNqMWFrZ3ZncjAwNmQzM3BmazRtNngxam8ifQ.DNMc6j7E4Gh7UkUAaEAPxA';

var map = new mapboxgl.Map({
  container: 'map',
  //style: 'mapbox://styles/tattii/cj8fozpkv0jn22rnwn6h65hvc',
  style: 'mapbox://styles/tattii/cj1bob6hw003t2rr5s2svi3iq',
  zoom: 4.2,
  center: [136.6, 35.5],
  attributionControl: false,
  logoPosition: 'bottom-right',
  hash: true,
  localIdeographFontFamily: "'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Meiryo, メイリオ, sans-serif"
});

map.on('load', async function() {
  const url = 'https://storage.googleapis.com/weather-map/analysis/202001260900.geojson';
  const res = await fetch(url, { mode: 'cors' });
  const geojson = await res.json();
  console.log(geojson);
  map.addSource('weathermap', {
    type: 'geojson',
    data: geojson
    //data: 'weathermap-xml/da0ee85d-30e2-3357-9e6c-edcae1dd1280.geojson'
  });

  map.addLayer({
    "id": "isobar",
    "type": "line",
    "source": "weathermap",
    "paint": {
      "line-color": "#ccc",
    },
    "filter": ["==", "type", "isobar"]
  });
  
  map.addLayer({
    "id": "cold-front",
    "type": "line",
    "source": "weathermap",
    "paint": {
      //"line-pattern": "Cold_front_symbol",
      "line-width": 40
    },
    "filter": ["in", "type", "寒冷前線", "温暖前線", "停滞前線", "閉塞前線"]
  });
  
  map.addLayer({
    "id": "symbol",
    "type": "symbol",
    "source": "weathermap",
    "paint": {}
  });
});

