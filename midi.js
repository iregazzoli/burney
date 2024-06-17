import {
  coloredKeys,
  specialKeys,
  resetColoredKeys,
  activateConfig,
} from "./main.js";
// Variables para las salidas MIDI
let midiOut;
let notesOn = [];
let pedalIsDown = false;
let notesSustained = [];
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

function handlePedal(command, originalNote, velocity) {
  if (command === 0xb0 && originalNote === 64) {
    pedalIsDown = velocity > 63;
    if (!pedalIsDown) {
      // Pedal was released, stop all notes in notesSustained that are not currently pressed
      notesSustained.forEach((note) => {
        // Check if the note is not currently pressed
        if (!notesOn.some((n) => n.value === note.value)) {
          sendMIDIMessage([note.channel, note.value, 0]);
        }
      });
      // Clear notesSustained
      notesSustained = [];
    }
  }
}

function handleNoteOn(note, newCommand, newVelocity) {
  // Always send a "note off" message before a "note on" message
  sendMIDIMessage([newCommand, note.value, 0]);
  notesOn.push({
    value: note.value,
    volume: newVelocity,
    channel: newCommand,
  });
  // Always play the note when it's pressed
  sendMIDIMessage([newCommand, note.value, newVelocity]);
}

function handleNoteOff(note, newCommand, newVelocity) {
  // Remove the note from notesOn
  notesOn = notesOn.filter((n) => n.value !== note.value);

  // Send a note off message if the pedal is not down
  if (!pedalIsDown) {
    sendMIDIMessage([newCommand, note.value, 0]);
  } else {
    // Check if the note is already in notesSustained to avoid duplicates
    const isNoteSustained = notesSustained.some((n) => n.value === note.value);
    if (!isNoteSustained) {
      // If the pedal is down and the note is not already sustained, add it to notesSustained
      notesSustained.push({
        value: note.value,
        volume: newVelocity,
        channel: newCommand,
      });
    }
    return;
  }

  // If the pedal is not down, ensure the note is also removed from notesSustained
  notesSustained = notesSustained.filter((n) => n.value !== note.value);
}

function handleMIDIMessage(message) {
  // If shouldProcessMIDIMessages is false, return immediately without processing the message
  if (!shouldProcessMIDIMessages) return;

  let data = message.data;
  let command = data[0];
  let originalNote = data[1];
  let velocity = data[2] || 0;

  handlePedal(command, originalNote, velocity);

  if (command === 0x90 || command === 0x80) {
    let notes = mapVariousNotes(originalNote, velocity);

    let commandType;
    let newCommand;
    let channel;
    for (let note of notes) {
      commandType = command & 0xf0;
      // If the note is already on, send the message on channel 1, otherwise send it on channel 0
      channel = notesOn.find((n) => n.value === note.value) ? 1 : 0;
      newCommand = commandType | channel;
      // Calculate the new velocity
      let newVelocity = Math.round(velocity * (note.volume / 100));

      // Update the notesOn array after sending the MIDI message
      if (velocity !== 0) {
        handleNoteOn(note, newCommand, newVelocity);
      } else if (velocity === 0) {
        handleNoteOff(note, newCommand, newVelocity);
      }
    }
  }
}

// Función para enviar mensajes MIDI
function sendMIDIMessage(message) {
  if (midiOut) {
    midiOut.send(message);
  }
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
