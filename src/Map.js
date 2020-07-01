import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'

import BaseLayer from './BaseLayer';
import './Map.css';

import WeatherMap from './WeatherMap';

mapboxgl.accessToken = 'pk.eyJ1IjoidGF0dGlpIiwiYSI6ImNqZWZ4eWM3NTI2cGszM2xpYXEyZndpd3IifQ.ifzbR45HecVGxChbdR2hiw';

const layers = [
  {
    id: 'weather-map',
    component: WeatherMap,
    name: '天気図',
    icon: 'warning sign'
  },
];


export default class Map extends Component {
  state = { layerIndex: 0 };

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/tattii/ckc0b6ks64uks1io9nljrkbhs',
      zoom: 4.2,
      center: [136.6, 35.5],
      hash: true,
      logoPosition: 'bottom-right',
      attributionControl: false
    });

    this.map.on('load', () => {
      this.base = new BaseLayer(this.map);
      this.child.onload(this.map);
    });
  }

  render() {
    return (
      <div className="app">
        <div ref={el => this.mapContainer = el} id="map" />
        {this.renderLayer()}
      </div>
    )
  }

  renderLayer() {
    const props = {
      map: this.map,
      ref: ref => this.child = ref,
    };
    return React.createElement(layers[this.state.layerIndex].component, props);
  }

  selectLayer = (index) => {
    this.setState({ layerIndex: index });
  }
}
