const associatedKeys = {};
let myKeyboard = new Keyboard(canvas, associatedKeys);
document.getElementById("resetButton").addEventListener("click", () => {
  myKeyboard.resetColoredKeys();
});
