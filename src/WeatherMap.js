import React, { Component } from 'react';

import WeatherMapLayer from './weather-map-layer';
import TimeButton from './TimeButton';

const url = 'https://storage.googleapis.com/weather-map/weather-map.json';

export default class Warning extends Component {
  state = {
    data: null,
  };

  componentDidMount() {
    this.map = this.props.map;
    this.load();
  }

  componentWillUnmount() {
    this.layer.remove();
  }

  onload(map) {
    this.map = map;
    this.addLayer();
  }
  
  load() {
    const timestamp = new Date().getTime();
    fetch(url + '?' + timestamp, { mode: 'cors' })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        this.setState({ data });
        this.data = data;
        this.addLayer();
      });
  }

  addLayer() {
    if (!this.map || !this.data) return;
    this.layer = new WeatherMapLayer(this.map, this.data);
  }

  render() {
    return <TimeButton
      data={this.state.data}
      select={this.select}
    />;
  }

  select = (datetime, url, type) => {
    this.layer.set(datetime, url, type);
  }
}
