import React, { Component } from 'react';
import './App.css';

import mic from './mic';

class App extends Component {
  constructor() {
    super();

    this.state = {
      average: 0,
      lastClap: (new Date()).getTime(),
      isClap: false,
      bgColor: '#ccc',
      freqs: [],
      frequencyBinCount: []
    }
  }

  componentDidMount() {
    const ctx = this.getCanvas(this.canvas);

    mic.init((average, data, freqs, frequencyBinCount) => {
      this.updateCanvas(ctx, average, freqs);
      this.detectClap(data);

      this.setState({
        average,
        freqs,
        frequencyBinCount
      });
    });
  }

  getCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0,0,0,200);

    gradient.addColorStop(1,'#000000');
    gradient.addColorStop(0.75,'#ff0000');
    gradient.addColorStop(0.25,'#ffff00');
    gradient.addColorStop(0,'#ffffff');
    // set the fill style
    ctx.fillStyle = gradient;

    return ctx;
  }

  updateCanvas(ctx, average, freqs) {
    // clear the current state
    ctx.clearRect(0, 0, 600, 200);
    // create the meters
    ctx.fillRect(0, 200 - average, 25, 200);
    this.drawSpectrum(ctx, freqs);
  }

  detectClap(data) {
    const t = (new Date()).getTime();
    const lastClap = this.state.lastClap;
    let isClap = false;

    if (t - lastClap < 200) {
      isClap = false;
    }
    let zeroCrossings = 0,
      highAmp = 0;

    for (let i = 1; i < data.length; i++) {
      if (Math.abs(data[i]) > 0.25) {
        highAmp++;
      }
      if ((data[i] > 0 && data[i-1] < 0) || (data[i] < 0 && data[i-1] > 0)) {
        zeroCrossings++;
      }
    }

    if (highAmp > 20 && zeroCrossings > 30) { // TWEAK HERE
      isClap = true;
      this.setState({
        lastClap: t
      });
    }

    const randomColors = Array.from({length: 3}, () => Math.floor(Math.random() * 255));
    const randomBg = `rgb(${randomColors[0]},${randomColors[1]},${randomColors[2]})`;
    const bgColor = isClap ? randomBg : this.state.bgColor;

    this.setState({
      isClap,
      bgColor
    });
  }

  drawSpectrum(ctx, array) {
    if (!array) {
      return;
    }
    for (let i = 0; i < (array.length); i++ ) {
        const value = array[i];
        ctx.fillRect(i * 5, 225 - value, 3, 225);
    }
  }

  render() {
    const freqs = this.state.freqs.filter(freq => freq !== 0);
    return (
      <div className="App" style={{
        backgroundColor: this.state.bgColor
      }}>
        <canvas
          id="canvas" width="600" height="200"
          ref={(canvas) => { this.canvas = canvas; }}
        />
        <div />
        <div>Sound: {this.state.average}</div>
        <div>Bg: {this.state.bgColor}</div>
        <div>freqs: {freqs}</div>
      </div>
    );
  }
}

export default App;
