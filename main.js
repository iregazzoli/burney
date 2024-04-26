const associatedKeys = {};
let canvas = document.getElementById("canvas");
let myKeyboard = new Keyboard(canvas, associatedKeys);
document.getElementById("resetKeyboardButton").addEventListener("click", () => {
  myKeyboard.resetColoredKeys();
});

//TODO: Make this buttom red while myKeyboard.resetKey is true
document.getElementById("resetKeyButton").addEventListener("click", () => {
  myKeyboard.resetColoredKey();
});

let mappedKeys = myKeyboard.getColoredKeys();
let displayDiv = document.getElementById("mapKeysDisplay");

canvas.addEventListener("click", function () {
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
    displayText += `Key ${key} -> ${values}\n`;
  }
  displayDiv.innerHTML = displayText;
});

let coloredKeys = {};

document
  .getElementById("applyTransformationBUtton")
  .addEventListener("click", () => {
    console.log("clicked!");
    coloredKeys = myKeyboard.getColoredKeys();
  });

export { coloredKeys };
