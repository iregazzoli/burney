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
    // Show the alert
    let alert = document.getElementById("alreadyMapKey");
    alert.style.opacity = "1";
    alert.style.visibility = "visible";

    setTimeout(() => {
      alert.style.opacity = "0";
      alert.style.visibility = "hidden";
    }, 3000);

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

function updateSpecialKeysDisplay() {
  specialKeys = myKeyboard.getSpecialKeys();
  let displayText = "";
  for (let key in specialKeys) {
    let noteName = myKeyboard.midiToNoteName(parseInt(key));
    let value =
      specialKeys[key].charAt(0).toUpperCase() + specialKeys[key].slice(1);
    displayText += `• Key ${noteName} → ${value}<br>`;
  }
  document.getElementById("specialKeysDisplay").innerHTML = displayText;
}

function resetColoredKeys() {
  coloredKeys = {};
}

function updateConfigurationsDisplay() {
  let displayText = "";
  for (let config of pianoConfigurations) {
    displayText += `<div style="padding-bottom: 10px;">`;
    displayText += `• Configuration: #${config.id}<br>`;
    displayText += `• Active: <span style="color: ${
      config.active ? "green" : "#e34b4b"
    };"><strong>${config.active ? "On" : "Off"}</strong></span><br>`;
    displayText += "Keys:<br>";
    for (let key in config.configuration) {
      let noteName = myKeyboard.midiToNoteName(parseInt(key));
      let values = config.configuration[key]
        .map((obj) => `Value: ${obj.value}`)
        .join(", ");
      displayText += `<div style="margin-left: 5px;">◦ Key ${noteName} → ${values}</div>`;
    }
    displayText += `</div>`;
  }
  document.getElementById("configurationsDisplay").innerHTML = displayText;
}

function saveConfiguration() {
  // Find the current maximum id in pianoConfigurations
  let maxId = pianoConfigurations.reduce(
    (max, config) => Math.max(max, config.id),
    0
  );

  // Create a new configuration with id incremented by 1
  let newConfig = {
    id: maxId + 1,
    active: false,
    configuration: coloredKeys,
  };

  // Add the new configuration to pianoConfigurations
  pianoConfigurations.push(newConfig);
  updateConfigurationsDisplay();
}

//coloredKeys ex of structure: {60: [{value: 45, volume: 100}, {value: 32, volume: 50}], 87: [{value: 32, volume: 25}]}
let coloredKeys = {};
let specialKeys;
let pianoConfigurations = [];
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

let resetKeyButton = document.getElementById("resetKeyButton");
resetKeyButton.addEventListener("click", () => {
  resetKeyButton.classList.add("active");
  myKeyboard.resetColoredKey();
});

let addResetButton = document.getElementById("addResetButton");
addResetButton.addEventListener("click", () => {
  addResetButton.classList.add("active");
  myKeyboard.mapResetKey();
});

canvas.addEventListener("click", updateDisplay);
canvas.addEventListener("click", updateSpecialKeysDisplay);

document.getElementById("applyChangesButton").addEventListener("click", () => {
  coloredKeys = myKeyboard.getColoredKeys();
  specialKeys = myKeyboard.getSpecialKeys();
});

document
  .getElementById("setConfigButton")
  .addEventListener("click", function () {
    let dropdown = document.getElementById("configDropdown");
    dropdown.innerHTML = ""; // Clear the dropdown
    for (let i = 0; i < pianoConfigurations.length; i++) {
      let item = document.createElement("li");
      let link = document.createElement("a");
      link.className = "dropdown-item";
      link.href = "#";
      link.textContent = "Config " + (i + 1);
      link.addEventListener("click", function () {
        // Handle selection of this configuration here
      });
      item.appendChild(link);
      dropdown.appendChild(item);
    }
  });

document
  .getElementById("saveConfigurationButton")
  .addEventListener("click", () => {
    saveConfiguration();
  });

export { coloredKeys, specialKeys, resetColoredKeys };
