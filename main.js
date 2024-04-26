const associatedKeys = {};

function updateDisplay() {
  let mappedKeys = myKeyboard.getColoredKeys();
  let displayText = "";
  for (let key in mappedKeys) {
    let values = Array.from(mappedKeys[key])
      .map((value) => {
        if (typeof value === "string" && value.startsWith("S")) {
          return `<del>${value.slice(1)}</del>`;
        } else {
          return value;
        }
      })
      .join(", ");
    displayText += `Key ${key} -> ${values}<br>`;
  }
  document.getElementById("mapKeysDisplay").innerHTML = displayText;
}

let canvas = document.getElementById("canvas");
let myKeyboard = new Keyboard(canvas, associatedKeys);

document.getElementById("resetKeyboardButton").addEventListener("click", () => {
  myKeyboard.resetColoredKeys();
  updateDisplay();
});
//TODO: Make this buttom red while myKeyboard.resetKey is true
document.getElementById("resetKeyButton").addEventListener("click", () => {
  myKeyboard.resetColoredKey();
});

canvas.addEventListener("click", updateDisplay);

let coloredKeys = {};

document
  .getElementById("applyTransformationBUtton")
  .addEventListener("click", () => {
    coloredKeys = myKeyboard.getColoredKeys();
  });

export { coloredKeys };
