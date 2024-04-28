import {
  coloredKeys,
  specialKeys,
  resetColoredKeys,
  pianoConfigurations,
  activateConfig,
} from "./main.js";
// Variables para las salidas MIDI
let midiOut;
let notesOn = {};
// Variable to keep track of whether the MIDI input should be processing messages
let shouldProcessMIDIMessages = true;
const controlChange = 0xb0; // Status byte para Control Change en canal MIDI
const localControl = 0x7a; // Número de control para Local Control
const offValue = 0x00; // Valor para 'Off'
const onValue = 127; // Valor para 'ON'

//TODO: this doesn't toggle it just turns it off
function toggleProcessingMIDIMessages() {
  shouldProcessMIDIMessages = !shouldProcessMIDIMessages;

  let value = shouldProcessMIDIMessages ? offValue : onValue;
  midiOut.send([controlChange + 0, localControl, value]);
}

// Solicitar acceso a los dispositivos MIDI
if (navigator.requestMIDIAccess) {
  navigator
    .requestMIDIAccess({ sysex: true })
    .then(onMIDISuccess, onMIDIFailure);
} else {
  console.log("Web MIDI API not supported!");
}

// Función de éxito: se llama cuando se obtiene acceso a los dispositivos MIDI
function onMIDISuccess(midiAccess) {
  // console.log("Conectado correctamente, escuchando teclas", midiAccess);
  console.log("Conectado correctamente, escuchando teclas");
  // Configurar la salida MIDI
  midiOut = [...midiAccess.outputs.values()][0]; // Ajustar índice si es necesario

  midiOut.send([controlChange + 0, localControl, offValue]);
  //Acá tendría que poner el de mono

  // console.log("out", midiOut);

  // Configurar la entrada MIDI
  const input = [...midiAccess.inputs.values()][0];
  // console.log("input", input);
  input.onmidimessage = handleMIDIMessage;
}

// Función para manejar los errores
function onMIDIFailure() {
  console.log("Could not access MIDI devices.");
}

function handleMIDIMessage(message) {
  // If shouldProcessMIDIMessages is false, return immediately without processing the message
  if (!shouldProcessMIDIMessages) {
    return;
  }
  let data = message.data;
  let command = data[0];
  let originalNote = data[1];
  let velocity = data[2] || 0;

  if (command === 0x90 || command === 0x80) {
    let notes = mapVariousNotes(originalNote, velocity);

    let commandType;
    let newCommand;
    let channel;
    for (let note of notes) {
      commandType = command & 0xf0;
      // If the note is already on, send the message on channel 1, otherwise send it on channel 0
      channel = notesOn[note.value] === "on" ? 1 : 0;
      newCommand = commandType | channel;
      // Calculate the new velocity
      let newVelocity = Math.round(velocity * (note.volume / 100));
      // console.log("command: ", newCommand);
      // console.log("note: ", note.value);
      // console.log("velocity: ", newVelocity);
      // Set the channel to 1 (last 4 bits)
      sendMIDIMessage([newCommand, note.value, newVelocity]);

      // Update the notesOn object after sending the MIDI message
      notesOn[note.value] = command === 0x90 && velocity !== 0 ? "on" : "off";
    }
  }
}

function handleQueNotaSalio(message) {
  let data = message.data;
  let command = data[0];
  let velocity = data[2] || 0;
}

// Función para enviar mensajes MIDI
function sendMIDIMessage(message) {
  if (midiOut) {
    midiOut.send(message);
  }
}

function getSymmetricMIDINote(midiNote) {
  // El "centro" de simetría está 2 notas por encima del Do central (C4)
  const symmetryCenter = 62;

  // Calcular la diferencia con respecto al centro
  let difference = midiNote - symmetryCenter;

  // Devolver la nota simétrica
  return symmetryCenter - difference;
}

//TODO hacewr que notas mas alla de la original las toque en otro canal
// o que todas vayan a otro canal y chau
function mapVariousNotes(midiNote, velocity) {
  if (specialKeys && specialKeys.hasOwnProperty(midiNote)) {
    if (specialKeys[midiNote] === "reset") {
      resetColoredKeys();
    } else if (/^Config \d+$/.test(specialKeys[midiNote]) && velocity !== 0) {
      let configNumber = specialKeys[midiNote].match(/\d+/)[0];
      activateConfig(parseInt(configNumber));
    }
  }
  if (coloredKeys && coloredKeys.hasOwnProperty(midiNote)) {
    // Filter out the object with value equal to S${midiNote}
    let filteredArray = coloredKeys[midiNote].filter(
      (obj) => obj.value !== `S${midiNote}`
    );
    return filteredArray;
  } else {
    return [{ value: midiNote, volume: 100 }];
  }
}
