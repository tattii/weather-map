import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import moment from 'moment';

import './TimeButton.css';

export default class TimeButton extends Component {
  state = {
    index: null,
    datetime: null,
  };

  componentDidMount() {
    this.listener = window.addEventListener('keydown', (e) => {
      console.log(e);
      if (e.key === 'ArrowLeft') {
        this.back();
      } else if (e.key === 'ArrowRight') {
        this.forward();
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.listener);
  }

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data) {
      const data = this.props.data;
      const forecasts = [data.forecast['24h'], data.forecast['48h']].map(d => {
        d.type = 'forecast';
        return d;
      });
      this.list = data.analysis.reverse().concat(forecasts);
      console.log(this.list);
      const datetime = this.datetime_str(data.analysis[0].datetime);
      this.setState({ index: data.analysis.length - 1, datetime });
    }
  }

  render() {
    return (
      <Button.Group className="time-button">
        <Button icon='left chevron' inverted onClick={this.back} />
        <Button content={this.state.datetime} inverted disabled />
        <Button icon='right chevron' inverted onClick={this.forward} />
      </Button.Group>
    );
  }

  back = () => {
    const index = Math.max(0, this.state.index - 1);
    this.set(index);
  }

  forward = () => {
    const index = Math.min(this.list.length - 1, this.state.index + 1);
    this.set(index);
  }

  set(index) {
    let datetime = this.datetime_str(this.list[index].datetime);
    if (this.list[index].type == 'forecast') datetime += '(予想)';
    this.setState({ index, datetime });
  }

  datetime_str(datetime) {
    return moment(datetime).format('MM/DD HH:mm');
  }
}
