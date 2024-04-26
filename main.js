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

  const fromMidi = noteNameToMidi(fromValue);
  const toMidi = noteNameToMidi(toValue);
  const originalKeyMidi = noteNameToMidi(originalKey);

  const originalSet = coloredKeys[originalKeyMidi];
  if (!originalSet) {
    console.error(`No key found for ${originalKey}`);
    return;
  }

  if (!originalSet.has(fromMidi)) {
    console.error(`No value found for ${fromValue}`);
    return;
  }

  // Replace the value
  originalSet.delete(fromMidi);
  originalSet.add(toMidi);

  // Update the display
  updateDisplay();
  // myKeyboard.updateColoredKeys(coloredKeys);
}

document.getElementById("updateKey").addEventListener("click", saveChanges);

function updateDisplay() {
  coloredKeys = myKeyboard.getColoredKeys();
  let displayText = "";
  for (let key in coloredKeys) {
    let noteName = myKeyboard.midiToNoteName(parseInt(key));
    let values = Array.from(coloredKeys[key])
      .map((value) => {
        let displayValue;
        if (typeof value === "string" && value.startsWith("S")) {
          displayValue = `<del>${myKeyboard.midiToNoteName(
            parseInt(value.slice(1))
          )}</del>`;
        } else {
          displayValue = myKeyboard.midiToNoteName(value);
        }
        return `<span class="clickable" onclick="document.getElementById('from').value = '${displayValue}'; document.getElementById('originalKeyValue').innerText = '${noteName}';">${displayValue}</span>`;
      })
      .join(", ");
    displayText += `• Key ${noteName} → ${values}<br>`;
  }
  document.getElementById("mapKeysDisplay").innerHTML = displayText;
}

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

document
  .getElementById("applyTransformationBUtton")
  .addEventListener("click", () => {
    coloredKeys = myKeyboard.getColoredKeys();
  });

export { coloredKeys };
