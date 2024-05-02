window.onload = function () {
  var canvas = document.getElementById("pianoEnclosure");
  var context = canvas.getContext("2d");

  context.fillStyle = "#252525";
  context.fillRect(0, 0, canvas.width, canvas.height);

  window.updateVolumeValue = function (value) {
    document.getElementById("volumeValue").innerText = value;
  };
};

// Fetch the list of configuration files
fetch("configList.json")
  .then((response) => response.json())
  .then((data) => {
    // Get the dropdown menu
    let dropdownMenu = document.getElementById("importConfigDropdown");

    // Clear the dropdown menu
    dropdownMenu.innerHTML = "";

    // Add a new list item for each configuration file
    data.configs.forEach((config) => {
      let listItem = document.createElement("li");
      let link = document.createElement("a");
      link.className = "dropdown-item";
      link.href = "#";
      link.textContent = config;
      listItem.appendChild(link);
      dropdownMenu.appendChild(listItem);

      // Add event listener to the link
      // Add event listener to the link
      link.addEventListener("click", function () {
        // Fetch the configuration file
        fetch("saved_configurations/" + config)
          .then((response) => response.json())
          .then((data) => {
            // Update the pianoConfigurations object
            pianoConfigurations = data;
            for (let key in pianoConfigurations) {
              pianoConfigurations[key].active = false;
            }
            console.log(pianoConfigurations);
            // Update the configurations display
            updateConfigurationsDisplay();
          });
      });
    });
  });

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
        return `<span class="clickable" onclick="document.getElementById('from').value = '${displayValue}'; document.getElementById('originalKeyValue').innerText = '${noteName}'; document.getElementById('volume').value = '${keyObject.volume}'; document.getElementById('volumeValue').innerText = '${keyObject.volume}';">${displayValue}</span>`;
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

function activateConfig(id) {
  // Find the index of the configuration with the given id
  let index = pianoConfigurations.findIndex((config) => config.id === id);

  // If no configuration with the given id is found, exit the function
  if (index === -1) return;

  // Toggle the active status of the selected configuration
  pianoConfigurations[index].active = !pianoConfigurations[index].active;

  // If the selected configuration is now active, deactivate all other configurations
  if (pianoConfigurations[index].active) {
    coloredKeys = pianoConfigurations[index].configuration;
    myKeyboard.setColoredKeys(pianoConfigurations[index].configuration);
    for (let i = 0; i < pianoConfigurations.length; i++) {
      if (i !== index) {
        pianoConfigurations[i].active = false;
      }
    }
  } else {
    // If the selected configuration is now inactive, reset coloredKeys
    coloredKeys = {};
    myKeyboard.setColoredKeys({});
  }

  // Update the display to reflect the changes
  updateConfigurationsDisplay();
}

function updateConfigurationsDisplay() {
  let displayText = "";
  let config;
  for (let i = 0; i < pianoConfigurations.length; i++) {
    config = pianoConfigurations[i];
    displayText += `<div style="padding-bottom: 10px;">`;
    displayText += `• Configuration: #${config.id}<br>`;
    displayText += `• Active: <span style="color: ${
      config.active ? "green" : "#e34b4b"
    };"><strong>${config.active ? "On" : "Off"}</strong></span><br>`;
    displayText += "Keys:<br>";
    for (let key in config.configuration) {
      let noteName = myKeyboard.midiToNoteName(parseInt(key));
      let values = config.configuration[key]
        .map((obj) => myKeyboard.midiToNoteName(obj.value))
        .join(", ");
      displayText += `<div style="margin-left: 5px;">◦ Key ${noteName} → ${values}</div>`;
    }
    displayText += `</div>`;
  }
  document.getElementById("configurationsDisplay").innerHTML = displayText;
}

function saveConfiguration(index) {
  if (index !== undefined && pianoConfigurations[index]) {
    // Overwrite the existing configuration at the provided index
    pianoConfigurations[index].configuration = coloredKeys;
  } else {
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
  }
  updateConfigurationsDisplay();
}

function exportConfigurations() {
  // Convert the pianoConfigurations object to a JSON string
  let dataStr = JSON.stringify(pianoConfigurations);

  // Create a data URI
  let dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  // Create a new anchor element
  let exportFileDefaultName = "configurations.json";
  let linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

// Attach the function to your button
document
  .getElementById("exportConfigButton")
  .addEventListener("click", exportConfigurations);

function deleteConfiguration(index) {
  if (index !== undefined && pianoConfigurations[index]) {
    // Delete the configuration at the provided index
    pianoConfigurations.splice(index, 1);

    // Update the IDs of the remaining configurations
    for (let i = index; i < pianoConfigurations.length; i++) {
      pianoConfigurations[i].id = i + 1;
    }
  }

  updateConfigurationsDisplay();
}

//coloredKeys ex of structure: {60: [{value: 45, volume: 100}, {value: 32, volume: 50}], 87: [{value: 32, volume: 25}]}
let coloredKeys = {};
let specialKeys;
let pianoConfigurations = [];
let canvas = document.getElementById("canvas");
let myKeyboard = new Keyboard(canvas, coloredKeys);
let selectedConfig = null;

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

let setResetButton = document.getElementById("setResetButton");
setResetButton.addEventListener("click", () => {
  setResetButton.classList.add("active");
  myKeyboard.mapResetKey();
});

canvas.addEventListener("click", updateDisplay);
canvas.addEventListener("click", updateSpecialKeysDisplay);

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
        selectedConfig = "Config " + (i + 1);
        myKeyboard.mapConfigKey(selectedConfig);
      });
      item.appendChild(link);
      dropdown.appendChild(item);
    }
  });

document
  .getElementById("saveConfigurationButton")
  .addEventListener("click", function () {
    let dropdown = document.getElementById("saveConfigDropdown");
    dropdown.innerHTML = ""; // Clear the dropdown

    // Add "New Config" option
    let newItem = document.createElement("li");
    let newLink = document.createElement("a");
    newLink.className = "dropdown-item";
    newLink.href = "#";
    newLink.textContent = "New Config";
    newLink.addEventListener("click", function () {
      saveConfiguration();
    });
    newItem.appendChild(newLink);
    dropdown.appendChild(newItem);

    // Add existing configurations
    for (let i = 0; i < pianoConfigurations.length; i++) {
      let item = document.createElement("li");
      let link = document.createElement("a");
      link.className = "dropdown-item";
      link.href = "#";
      link.textContent = "Config " + (i + 1);
      link.addEventListener("click", function () {
        saveConfiguration(i);
      });
      item.appendChild(link);
      dropdown.appendChild(item);
    }
  });

document
  .getElementById("deleteConfigButton")
  .addEventListener("click", function () {
    let dropdown = document.getElementById("deleteConfigDropdown");
    dropdown.innerHTML = ""; // Clear the dropdown

    // Add existing configurations
    for (let i = 0; i < pianoConfigurations.length; i++) {
      let item = document.createElement("li");
      let link = document.createElement("a");
      link.className = "dropdown-item";
      link.href = "#";
      link.textContent = "Config " + (i + 1);
      link.addEventListener("click", function () {
        deleteConfiguration(i);
      });
      item.appendChild(link);
      dropdown.appendChild(item);
    }
  });

export {
  coloredKeys,
  specialKeys,
  resetColoredKeys,
  pianoConfigurations,
  activateConfig,
};
