class WeatherMapFront {
  constructor(map, geojson) {
    this.map = map;
    this.add(geojson);
  }

  add(geojson) {
    const front = geojson.features.filter(f => f.properties.type.includes('前線'));
    const split = front.reduce((features, f) => {
      return features.concat(this.split(f).features);
    }, []);
    
    this.map.addSource('weathermap-front', {
      type: 'geojson',
      data: turf.featureCollection(split)
    });
    this.addLayer();
  }

  split(f) {
    const length = turf.length(f);
    const segment = f.properties.type === '停滞前線' ? 450 : 360; // km
    const chunks = turf.lineChunk(f, segment);
    for (let i in chunks.features) {
      chunks.features[i].properties = Object.assign({}, f.properties);
      if (turf.length(chunks.features[i]) < 100) {
        chunks.features[i].properties.z = 10;
      }
    }
    return chunks;
  }

  addLayer() {
    this.addFront('cold', '寒冷前線', -8);
    this.addFront('warm', '温暖前線', 5);
    this.addFront('stationary', '停滞前線', -3);
    this.addFront('occuluded', '閉塞前線', 7);
  }
  
  addFront(id, type, offset, width) {
    this.map.addLayer({
      "id": "front-symbol-" + id,
      "type": "symbol",
      "source": "weathermap-front",
      "minzoom": 3.0,
      "layout": {
        "icon-image": "front2-" + id,
        "icon-size": [
          'interpolate',
          ['exponential', 1.0],
          ['zoom'],
          3, 0.6,
          8, 1.6
        ],
        "symbol-placement": "line-center",
        "symbol-spacing": 100,
        "icon-offset": [0, offset],
        "icon-rotate": 180,
      },
      "filter": ["all",
        ["==", "type", type],
        ["!=", "z", 10]
      ]
    });
  }
}
