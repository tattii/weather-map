class WeatherMap {
  constructor(map) {
    this.map = map;
    this.indexJson = 'https://storage.googleapis.com/weather-map/weather-map.json'
    this._add();
  }

  async _add() {
    const res = await fetch(this.indexJson, { mode: 'cors' });
    this.index = await res.json();
    console.log(this.index);
    this.addLayer(this.index.analysis[0].url);
  }

  async addLayer(url) {
    const res = await fetch(url, { mode: 'cors' });
    const geojson = await res.json();
    console.log(geojson);
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
    
    this.map.addLayer({
      "id": "front",
      "type": "line",
      "source": "weathermap",
      "paint": {
        "line-width": 4,
        "line-color": [
          "match",
          ["get", "type"],
          "寒冷前線", "blue",
          "温暖前線", "red",
          "停滞前線", "purple",
          "閉塞前線", "purple",
          /* default */ "#000"
        ]
      },
      "filter": ["in", "type", "寒冷前線", "温暖前線", "停滞前線", "閉塞前線"]
    });
    
    this.map.addLayer({
      "id": "front-symbol",
      "type": "line",
      "source": "weathermap",
      "paint": {
        "line-pattern": "triangle-15",
        "line-offset": 5,
        "line-width": 20
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

