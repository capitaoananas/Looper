window.AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx;
const startButton = document.querySelector("button");
const oscillators = {};

function midiToFreq(number) {
  const a = 440;
  return (a / 32) * 2 ** ((number - 9) / 12);
}

startButton.addEventListener("click", () => {
  ctx = new AudioContext();
  console.log(ctx);
});

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(success, failure);
}

function success(midiAccess) {
  midiAccess.onstatechange = updateDevices;

  const inputs = midiAccess.inputs;

  inputs.forEach((input) => {
    input.addEventListener("midimessage", handleInput);
  });
}

function handleInput(input) {
  const command = input.data[0];
  const note = input.data[1];
  const velocity = input.data[2];

  switch (command) {
    case 145: // note on
      if (velocity > 0) {
        noteOn(note, velocity);
      } else {
        noteOff(note);
      }
      break;
    case 129: // note off
      noteOff(note);
      break;
  }
}

function noteOn(note, velocity) {
  const osc = ctx.createOscillator();
  oscillators[note.toString()] = osc;
  console.log(oscillators);

  const oscGain = ctx.createGain();
  oscGain.gain.value = 0.33;
  osc.type = "sine";
  osc.frequency.value = midiToFreq(note);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start();
}

function noteOff(note) {
  const osc = oscillators[note.toString()];
  osc.stop();
}

function updateDevices(event) {
  console.log(
    `Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State: ${event.port.state}, Type: ${event.port.type}`,
  );
}

function failure() {
  console.log("MIDI access request failed");
}
