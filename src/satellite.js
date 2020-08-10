export default class Satellite {
  constructor(map) {
    this.map = map;
    this.add();
  }

  add() {
    fetch('https://dkve47d2tju8b.cloudfront.net/omaad/rsmc_nowcast/en/jmatile/data/hcai/targetTimes.json', { mode: 'cors' })
      .then(res => { console.log(res); return res.json(); })
      .then(data => {
        this.index = data;
        this.addLayer(data[data.length - 1]);
      });
  }

  
  addLayer(d) {
    const url = 'https://www.data.jma.go.jp/tile/satimg/' + d.basetime + '/fd/' + d.validtime + '/B13/TBB/{z}/{x}/{y}.png';
    this.map.addSource('satellite', {
      type: 'raster',
      tiles: [url],
      minzoom: 1,
      maxzoom: 6,
      //bouds: [119, 19, 155, 51]
    });

   this. map.addLayer({
      "id": "satellite",
      "type": "raster",
      "source": "satellite",
      "paint": {
        "raster-opacity": 0.3
      }
    }, "isobar-2hPa");
  }
  
  addLayerJP(d) {
    const url = 'https://www.data.jma.go.jp/tile/satprod/' + d.basetime + '/JP/' + d.validtime + '/B13/TBB/{z}/{x}/{y}.png';
    this.map.addSource('satellite', {
      type: 'raster',
      tiles: [url],
      minzoom: 3,
      maxzoom: 7,
      bouds: [119, 19, 155, 51]
    });
  }
}
