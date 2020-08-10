import mapboxgl from 'mapbox-gl';

import WeatherMapFront from './weather-map-front';
import Satellite from './satellite';

export default class WeatherMapLayer {
  constructor(map, data, onSelected) {
    this.map = map;
    this.data = data;
    this.onSelected = onSelected;
    this.layerId = 'weather-map';

    this.addMap();
  }

  addMap() {
    this.render();
    this.addLayer(this.data.analysis[0].url);
    //this.addLayer('https://storage.googleapis.com/weather-map/analysis/202006280000.geojson');

    this.popup = new mapboxgl.Popup({
      closeButton: false
    });
    //this.map.on('mousemove', this.hover);
  }

  remove() {
    this.map.removeLayer(this.layerId);
    this.map.off('mousemove', this.hover);
    this.popup.remove();
  }

  render() {
  }
  
  async addLayer(url) {
    const res = await fetch(url, { mode: 'cors' });
    const geojson = await res.json();
    //console.log(geojson);

    geojson.features.forEach((f, i) => {
      if (f.properties.type === 'isobar') {
        if (f.properties.pressure % 20 === 0) {
          geojson.features[i].properties.isobar = '20hPa';
        } else if (f.properties.pressure % 4 === 0) {
          geojson.features[i].properties.isobar = '4hPa';
        } else if (f.properties.pressure % 2 === 0) {
          geojson.features[i].properties.isobar = '2hPa';
        }
      }
    });
    this.map.addSource('weathermap', {
      type: 'geojson',
      data: geojson
    });

    this.addIsobar('2hPa', 0.75, [10, 5]);
    this.addIsobar('4hPa', 0.75);
    this.addIsobar('20hPa', 1.5);

    
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
   
    this.addSymbols();
    this.addTyphoons(geojson);
    
    this.satellit = new Satellite(this.map);
  }

  addIsobar(type, width, dash) {
    const paint = {
      "line-color": "#ccc",
      "line-opacity": 0.3,
      "line-width": width
    };
    if (dash) paint['line-dasharray'] = dash;
    this.map.addLayer({
      "id": "isobar-" + type,
      "type": "line",
      "source": "weathermap",
      "paint": paint,
      "filter": ["all",
        ["==", "type", "isobar"],
        ["==", "isobar", type]
      ]
    });
  }
  
  addSymbols() {
    this.map.addLayer({
      "id": "symbol",
      "type": "symbol",
      "source": "weathermap",
      "layout": {
        "icon-image": "center",
        "icon-size": 0.6,
        "icon-allow-overlap": true
      },
      "paint": {
        "icon-opacity": 0.7
      },
      filter: ["in", "type", "低気圧", "高気圧", "熱帯低気圧"]
    });
    
    this.map.addLayer({
      "id": "symbol-pressure",
      "type": "symbol",
      "source": "weathermap",
      "minzoom": 3.0,
      "layout": {
        "text-field": "{pressure}",
        "text-size": 12,
        "text-font": ["DIN Pro Regular"],
        "text-offset": [0, 1.4]
      },
      "paint": {
        "text-color": "rgba(255, 255, 255, 0.8)"
      },
      filter: ["in", "type", "低気圧", "高気圧", "熱帯低気圧"]
    });

    this.addLabel('低気圧', 'L', '#7A1C1C');
    this.addLabel('高気圧', 'H', '#1437B1');
    this.addLabel('熱帯低気圧', 'TD', '#7A1C1C');
  }

  addLabel(type, label, color) {
    this.map.addLayer({
      "id": "symbol-" + label,
      "type": "symbol",
      "source": "weathermap",
      "layout": {
        "text-field": label,
        "text-size": 20,
        "text-font": ["DIN Pro Bold"],
        "text-offset": [0, -1.0]
      },
      "paint": {
        "text-color": color,
        "text-halo-color": "rgba(255, 255, 255, 0.4)",
        "text-halo-width": 1
      },
      filter: ["==", "type", type]
    });
  }

  addTyphoons(geojson) {
    const typhoon = geojson.features.filter(f => 'typhoonClass' in f.properties)
      .map(f => {
        f.properties.pressure = f.properties.center.pressure;
        f.properties.name = '台' + parseInt(f.properties.name.number.substr(2)) + '号';
        return f;
      });
    this.map.addSource('weathermap-ty', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: typhoon }
    });

    this.map.addLayer({
      "id": "symbol-ty-pressure",
      "type": "symbol",
      "source": "weathermap-ty",
      "minzoom": 3.0,
      "layout": {
        "text-field": "{pressure}",
        "text-allow-overlap": true,
        "text-size": 12,
        "text-font": ["DIN Pro Regular"],
        "text-offset": [-1.6, 2.2]
      },
      "paint": {
        "text-color": "rgba(255, 255, 255, 0.8)"
      },
    });
    this.map.addLayer({
      "id": "symbol-ty",
      "type": "symbol",
      "source": "weathermap-ty",
      "layout": {
        "icon-image": "center",
        "icon-size": 0.6,
        "icon-allow-overlap": true,
        "text-field": "{name}",
        "text-size": 12,
        "text-font": ["Noto Sans CJK JP Regular"],
        "text-offset": [-1.5, 1]
      },
      "paint": {
        "icon-opacity": 0.7,
        "text-color": "rgba(255, 255, 255, 0.8)"
      },
    });
  }


  hover = (e) => {
    const features = this.map.queryRenderedFeatures(e.point, { layers: [this.layerId] });
    this.map.getCanvas().style.cursor = (features.length) ? 'crosshair' : '';

    let html;
    if (features.length) {
      const code = features[0].properties.code;
      html = code;
    }
    
    if (html) {
      this.popup.setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(this.map);
    } else {
      this.popup.remove();
    }
  }
}
