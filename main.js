window.onload = function () {
  var canvas = document.getElementById("pianoEnclosure");
  var context = canvas.getContext("2d");

  context.fillStyle = "#252525";
  context.fillRect(0, 0, canvas.width, canvas.height);
};

function updateDisplay() {
  let mappedKeys = myKeyboard.getColoredKeys();
  let displayText = "";
  for (let key in mappedKeys) {
    let noteName = myKeyboard.midiToNoteName(parseInt(key));
    let values = Array.from(mappedKeys[key])
      .map((value) => {
        if (typeof value === "string" && value.startsWith("S")) {
          return `<del>${myKeyboard.midiToNoteName(
            parseInt(value.slice(1))
          )}</del>`;
        } else {
          return myKeyboard.midiToNoteName(value);
        }
      })
      .join(", ");
    displayText += `Key ${noteName} -> ${values}<br>`;
  }
  document.getElementById("mapKeysDisplay").innerHTML = displayText;
}

const associatedKeys = {};
let canvas = document.getElementById("canvas");
let myKeyboard = new Keyboard(canvas, associatedKeys);

document.getElementById("resetKeyboardButton").addEventListener("click", () => {
  myKeyboard.resetColoredKeys();
  updateDisplay();
});

document.getElementById("resetKeyButton").addEventListener("click", () => {
  myKeyboard.resetColoredKey();
  document.getElementById("resetKeyButton").classList.add("active");
});

canvas.addEventListener("click", updateDisplay);

let coloredKeys = {};

document
  .getElementById("applyTransformationBUtton")
  .addEventListener("click", () => {
    coloredKeys = myKeyboard.getColoredKeys();
  });

export { coloredKeys };
