// Variables para las salidas MIDI
let midiOut;
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

// Función para manejar los mensajes MIDI entrantes
function handleMIDIMessage(message) {
  // If shouldProcessMIDIMessages is false, return immediately without processing the message
  if (!shouldProcessMIDIMessages) {
    return;
  }
  console.log("Mensaje es:", message);
  let data = message.data;
  let command = data[0];
  let note = data[1];
  let velocity = data[2] || 0;

  if (command === 0x90 || command === 0x80) {
    // console.log(
    //   "nota presionada",
    //   command === 0x90 ? "note-on" : "note-off",
    //   data[1]
    // );
    let notes = mapVariousNotes(note);

    for (let i = 0; i < notes.length; i++) {
      console.log("Playing note: ", notes[i]);
      sendMIDIMessage([command, notes[i], velocity]);
    }
  }
}

function handleQueNotaSalio(message) {
  let data = message.data;
  let command = data[0];
  let velocity = data[2] || 0;

  console.log("finalmente tocamos", data[1]);
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

function mapVariousNotes(midiNote) {
  if (midiNote === 21) {
    toggleProcessingMIDIMessages();
  }
  if (midiNote === 60) {
    return [midiNote, 72];
  } else {
    return [midiNote];
  }
}
