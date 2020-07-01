
export default class BaseLayer {
  constructor(map) {
    this.map = map;
    this.map.addSource("vt", {
      "type": "vector",
      "minzoom": 0,
      "maxzoom": 10,
      "tiles": ["https://weatherbox.github.io/warning-area-vt/v2/{z}/{x}/{y}.pbf"]
    });

    this.map.addLayer({
      "id": "pref-line",
      "type": "line",
      "source": "vt",
      "source-layer": "pref",
      "paint": {
        "line-color": "rgba(70, 70, 70, 0.4)"
      }
    });
  }
}
