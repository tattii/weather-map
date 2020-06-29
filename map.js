mapboxgl.accessToken = 'pk.eyJ1IjoidGF0dGlpIiwiYSI6ImNqMWFrZ3ZncjAwNmQzM3BmazRtNngxam8ifQ.DNMc6j7E4Gh7UkUAaEAPxA';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/tattii/ckc0b6ks64uks1io9nljrkbhs',
  zoom: 4.2,
  center: [136.6, 35.5],
  attributionControl: false,
  logoPosition: 'bottom-right',
  hash: true,
  localIdeographFontFamily: "'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Meiryo, メイリオ, sans-serif"
});

map.on('load', async function() {
  const weathermap = new WeatherMap(map); 
});


