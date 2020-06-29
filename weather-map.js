class WeatherMap {
  constructor(map) {
    this.map = map;
    this.indexJson = 'https://storage.googleapis.com/weather-map/weather-map.json';
    this._add();
  }

  async _add() {
    const res = await fetch(this.indexJson, { mode: 'cors' });
    this.index = await res.json();
    console.log(this.index);
    //this.addLayer('https://storage.googleapis.com/weather-map/analysis/202006280000.geojson');
    this.addLayer(this.index.analysis[0].url);
  }

  async addLayer(url) {
    const res = await fetch(url, { mode: 'cors' });
    const geojson = await res.json();
    //console.log(geojson);
    const satellite = new Satellite(this.map);

    this.map.addSource('weathermap', {
      type: 'geojson',
      data: geojson
    });

    this.map.addLayer({
      "id": "isobar",
      "type": "line",
      "source": "weathermap",
      "paint": {
        "line-color": "#ccc",
        "line-opacity": 0.7
      },
      "filter": ["==", "type", "isobar"]
    });
    
    this.front = new WeatherMapFront(this.map, geojson);
    this.map.addLayer({
      "id": "front",
      "type": "line",
      "source": "weathermap",
      "paint": {
        "line-width": 4,
        "line-color": [
          "match",
          ["get", "type"],
          "寒冷前線", "#1437B1",
          "温暖前線", "#7A1C1C",
          "停滞前線", "#39144C",
          "閉塞前線", "#39144C",
          /* default */ "#000"
        ]
      },
      "filter": ["in", "type", "寒冷前線", "温暖前線", "停滞前線", "閉塞前線"]
    });
    

    this.map.addLayer({
      "id": "symbol",
      "type": "symbol",
      "source": "weathermap",
      "paint": {}
    });
  }
}

