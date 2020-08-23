import moment from 'moment';

export default class Satellite {
  constructor(map) {
    this.map = map;
    this.add();
    this.show = null;
  }

  add() {
    fetch('https://dkve47d2tju8b.cloudfront.net/omaad/rsmc_nowcast/en/jmatile/data/hcai/targetTimes.json', { mode: 'cors' })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        this.data = data;
        this.show = data.length - 1;
        this.addLayer(data[this.show]);
      });
  }

  hide(index) {
    const id = 'sat-' + this.data[index || this.show].validtime;
    if (this.map.getLayer(id)) this.map.removeLayer(id);
    if (this.map.getSource(id)) this.map.removeSource(id);
  }
 
  set(datetime) {
    if (!this.data) return;
    const index = this.data.findIndex(d => {
      return moment(datetime) - moment.utc(d.validtime, 'YYYYMMDDHHdd') === 0;
    });
    console.log(index);
    if (index < 0) {
      this.hide();
    } else {
      this.addLayer(this.data[index]);
      this.hide(this.show);
      this.show = index;
    }
  }

  addLayer(d) {
    const url = 'https://www.data.jma.go.jp/tile/satimg/' + d.basetime + '/fd/' + d.validtime + '/B13/TBB/{z}/{x}/{y}.png';
    const id = 'sat-' + d.validtime;
    this.map.addSource(id, {
      type: 'raster',
      tiles: [url],
      minzoom: 1,
      maxzoom: 6,
      //bouds: [119, 19, 155, 51]
    });

   this. map.addLayer({
      "id": id,
      "type": "raster",
      "source": id,
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
