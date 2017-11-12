const mic = {
  init(callback) {
    if (this.isAudioSupported()) {
      this.record(new AudioContext(), callback);
    } else {
      console.log('Web Audio API is not supported in this browser');
    }
  },

  isAudioSupported() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    return window.AudioContext && navigator.getUserMedia;
  },

  getAudioNodes(context, stream) {
    const analyser = context.createAnalyser();
    const node = context.createScriptProcessor(2048, 1, 1);
    const input = context.createMediaStreamSource(stream);
    const sourceNode = context.createBufferSource();

    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;
    // analyser.minDecibels = -140;
    // analyser.maxDecibels = 0;


    const freqs = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqs);
    //const times = new Uint8Array(analyser.frequencyBinCount);
    sourceNode.connect(analyser);
    input.connect(analyser);
    analyser.connect(node);
    node.connect(context.destination);

    return {
      node,
      analyser,
      freqs
    };
  },

  handleAudioProcess(callback, context, stream) {
    const _this = this;
    const { node, analyser } = this.getAudioNodes(context, stream);
    node.onaudioprocess = (event) => {
      const array = new Uint8Array(analyser.frequencyBinCount);
      const left = event.inputBuffer.getChannelData(0);

      analyser.getByteFrequencyData(array);

      const average = _this.getAverageVolume(array);
      callback(average, new Float32Array(left), array, analyser.frequencyBinCount);
    };
  },

  getAverageVolume(array) {
      let values = 0;
      let average;

      const length = array.length;
      // get all the frequency amplitudes
      for (let i = 0; i < length; i++) {
          values += array[i];
      }

      average = values / length;
      return average;
  },

  record(context, callback) {
    const _this = this;
    navigator.getUserMedia({ audio: true }, stream => _this.handleAudioProcess(callback, context, stream), _this.handleError);
  },

  handleError(error) {
    console.log('Error', error)
  }
};

export default mic;
