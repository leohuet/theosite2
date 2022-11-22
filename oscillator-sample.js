/*
 * Copyright 2013 Boris Smus. All Rights Reserved.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var impulseResponse = '/sound-impulses/cathedral.wav'

function OscillatorSample() {
  this.isPlaying = false;
  // this.canvas = document.querySelector('canvas');
  // console.log(this.canvas);
  this.WIDTH = 640;
  this.HEIGHT = 240;
  this.scale = 10;
  this.duration = 1;
  window.addEventListener("mousemove", (e) => {
      let xPos = e.clientX;
      let yPos = e.clientY;
      this.frequency = (cos(xPos)+1)*10;
      // console.log(this.frequency);
    });
  // this.frequency = document.querySelector('#LFOfreq');
}

function RoomEffectsSample(inputs) {
  var ctx = this;
  ctx.setImpulseResponse();

  this.impulseResponses = [];
  this.buffer = null;

  // Load all of the needed impulse responses and the actual sample.
  var loader = new BufferLoader(context, [
    "impulse.wav"
  ], onLoaded);

  function onLoaded(buffers) {
    ctx.buffer = buffers[0];
    ctx.impulseResponses = buffers.splice(1);
    ctx.impulseResponseBuffer = ctx.impulseResponses[0];
  }
  loader.load();
}

RoomEffectsSample.prototype.setImpulseResponse = function() {
  this.impulseResponseBuffer = this.impulseResponses[0];
  // Change the impulse response buffer.
  this.convolver.buffer = this.impulseResponseBuffer;
};

OscillatorSample.prototype.play = function() {
  // Create some sweet sweet nodes.
  this.oscillator = context.createOscillator();
  this.analyser = context.createAnalyser();

  this.oscillator.buffer = this.buffer;
  // Make a convolver node for the impulse response.
  var convolver = context.createConvolver();
  convolver.buffer = this.impulseResponseBuffer;
  // Connect the graph.
  this.oscillator.connect(convolver);
  convolver.connect(context.destination);
  // Save references to important nodes.
  this.convolver = convolver;

  // Pans the sound left/right. Synced with the
  // object's screen position.
  this.pannerNode = context.createStereoPanner();

  this.oscillator.connect(this.analyser);
  this.analyser.connect(context.destination);

  this.gainNode = context.createGain();
  // this.source = context.createBufferSource();
  // this.source.buffer = this.buffer;

  // Connect source to a gain node
  this.oscillator.connect(this.gainNode);

  // Connect gain node to destination
  this.gainNode.connect(context.destination);
  this.gainNode.gain.value = 0.8;

  this.oscillator[this.oscillator.start ? 'start' : 'noteOn'](0);

  requestAnimFrame(this.visualize.bind(this));
};

OscillatorSample.prototype.stop = function() {
  this.oscillator.stop(0);
};

OscillatorSample.prototype.toggle = function() {
  (this.isPlaying ? this.stop() : this.play());
  this.isPlaying = !this.isPlaying;
};

OscillatorSample.prototype.changeFrequency = function(val) {
  this.oscillator.frequency.value = val;
};

OscillatorSample.prototype.changeDetune = function(val) {
  this.oscillator.detune.value = val;
};

OscillatorSample.prototype.changeType = function(type) {
  this.oscillator.type = type;
};

OscillatorSample.prototype.changeGain = function(val) {
  this.gainNode.gain.value = val;
};

OscillatorSample.prototype.setValueCurve = function(element) {
  // Split the time into valueCount discrete steps.
  var valueCount = 4096;
  // Create a random value curve.
  var values = new Float32Array(valueCount);
  for (var i = 0; i < valueCount; i++) {
    var percent = (i / valueCount) * this.duration * this.frequency;
    values[i] = 1 + (Math.sin(percent * 2*Math.PI) * this.scale);
    // Set the last value to one, to restore playbackRate to normal at the end.
    if (i == valueCount - 1) {
      values[i] = 1;
    }
  }
  // Apply it to the gain node immediately, and make it last for 2 seconds.
  try{
    this.gainNode.gain.setValueCurveAtTime(values, context.currentTime, this.duration);
  }
  catch(error){

  }
};

OscillatorSample.prototype.setLFO = function(){
  osc[osc.stop ? 'stop': 'noteOff'];
  var osc = context.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = this.frequency;
  console.log(this.frequency)
  var gain = context.createGain();
  gain.gain.value = this.scale;
  // this.oscillator.connect(gain);
  osc.connect(gain);
  gain.connect(this.gainNode.gain);
  //osc.connect(this.source.playbackRate);

  // Start immediately, and stop in 2 seconds.
  osc[osc.start ? 'start' : 'noteOn'](0);
  osc[osc.stop ? 'stop': 'noteOff'](context.currentTime + this.duration);
};

OscillatorSample.prototype.visualize = function() {
  // this.canvas.width = this.WIDTH;
  // this.canvas.height = this.HEIGHT;
  // var drawContext = this.canvas.getContext('2d');

  var times = new Uint8Array(this.analyser.frequencyBinCount);
  this.analyser.getByteTimeDomainData(times);
  for (var i = 0; i < times.length; i++) {
    var value = times[i];
    var percent = value / 256;
    var height = this.HEIGHT * percent;
    var offset = this.HEIGHT - height - 1;
    var barWidth = this.WIDTH/times.length;
    // drawContext.fillStyle = 'black';
    // drawContext.fillRect(i * barWidth, offset, 1, 1);
  }
  requestAnimFrame(this.visualize.bind(this));
};
