window.onload = function () {
  var canvas = document.getElementById("pianoEnclosure");
  var context = canvas.getContext("2d");

  context.fillStyle = "#252525";
  context.fillRect(0, 0, canvas.width, canvas.height);

  window.updateVolumeValue = function (value) {
    document.getElementById("volumeValue").innerText = value;
  };
};

function noteNameToMidi(noteName) {
  if (!noteName) {
    return null;
  }

  const noteLookup = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };

  const octave = parseInt(noteName.slice(-1));
  const note = noteName.slice(0, -1);

  if (noteLookup[note] === undefined || isNaN(octave)) {
    throw new Error("Invalid note name");
  }

  return noteLookup[note] + (octave + 1) * 12;
}

function saveChanges() {
  const fromValue = document.getElementById("from").value;
  const toValue = document.getElementById("to").value;
  const originalKey = document.getElementById("originalKeyValue").innerText;
  const volumeValue = document.getElementById("volume").value;

  const fromMidi = noteNameToMidi(fromValue);
  let toMidi;
  if (toValue) {
    toMidi = noteNameToMidi(toValue);
  }
  const originalKeyMidi = noteNameToMidi(originalKey);

  const originalArray = coloredKeys[originalKeyMidi];
  if (!originalArray) {
    console.error(`No key found for ${originalKey}`);
    return;
  }

  const fromObject = originalArray.find((obj) => obj.value === fromMidi);
  if (!fromObject) {
    console.error(`No value found for ${fromValue}`);
    return;
  }

  // Check if the key is already mapped to the toValue
  if (toMidi && originalArray.some((obj) => obj.value === toMidi)) {
    throw new Error(`Key ${toValue} is already mapped`);
  }

  // Replace the value if toValue is not empty
  if (toValue) {
    fromObject.value = toMidi;
  }

  // Update the volume
  fromObject.volume = volumeValue;

  // Update the display
  updateDisplay();
}

document.getElementById("updateKey").addEventListener("click", saveChanges);

function updateDisplay() {
  coloredKeys = myKeyboard.getColoredKeys();
  let displayText = "";
  for (let key in coloredKeys) {
    let noteName = myKeyboard.midiToNoteName(parseInt(key));
    let values = coloredKeys[key]
      .map((keyObject) => {
        let displayValue;
        if (
          typeof keyObject.value === "string" &&
          keyObject.value.startsWith("S")
        ) {
          displayValue = `<del>${myKeyboard.midiToNoteName(
            parseInt(keyObject.value.slice(1))
          )}</del>`;
        } else {
          displayValue = myKeyboard.midiToNoteName(keyObject.value);
        }
        return `<span class="clickable" onclick="document.getElementById('from').value = '${displayValue}'; document.getElementById('originalKeyValue').innerText = '${noteName}';">${displayValue}</span>`;
      })
      .join(", ");
    displayText += `• Key ${noteName} → ${values}<br>`;
  }
  document.getElementById("mapKeysDisplay").innerHTML = displayText;
}

//coloredKeys ex of structure: {60: [{value: 45, volume: 100}, {value: 32, volume: 50}], 87: [{value: 32, volume: 25}]}
let coloredKeys = {};
let canvas = document.getElementById("canvas");
let myKeyboard = new Keyboard(canvas, coloredKeys);

document.getElementById("resetKeyboardButton").addEventListener("click", () => {
  myKeyboard.resetColoredKeys();
  updateDisplay();

  // Show the alert
  let alert = document.getElementById("resetAlert");
  alert.style.opacity = "1";
  alert.style.visibility = "visible";

  setTimeout(() => {
    alert.style.opacity = "0";
    alert.style.visibility = "hidden";
  }, 3000);
});

document.getElementById("resetKeyButton").addEventListener("click", () => {
  document.getElementById("resetKeyButton").classList.add("active");
  myKeyboard.resetColoredKey();
});

canvas.addEventListener("click", updateDisplay);

document.getElementById("applyChangesButton").addEventListener("click", () => {
  coloredKeys = myKeyboard.getColoredKeys();
  console.log(coloredKeys);
});

export { coloredKeys };
