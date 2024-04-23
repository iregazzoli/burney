function DrawKeyboard(canvas) {
  // general characteristics of a piano

  let whiteKeys = [];
  let blackKeys = [];
  let keys = [];

  let NUM_WHITE_KEYS = 52;

  let ctx = canvas.getContext("2d");

  let X_BORDER = 0;
  let Y_BORDER = 0;

  let width = canvas.width - X_BORDER * 2;
  let height = canvas.height - Y_BORDER * 2;

  let WHITE_KEY_WIDTH = width / NUM_WHITE_KEYS;
  let WHITE_KEY_HEIGHT = height;

  let BLACK_KEY_WIDTH = WHITE_KEY_WIDTH * 0.75;
  let BLACK_KEY_HEIGHT = height * 0.66;

  function DrawRectWithBorder(X, Y, Width, Height, Color1, Color2) {
    //draw border
    ctx.fillStyle = Color1;
    ctx.fillRect(X, Y, Width, Height);

    //draw inside
    ctx.fillStyle = Color2;
    ctx.fillRect(X + 1, Y + 1, Width - 2, Height - 2);
  }

  // draws a back key, based on whiteKeyIndex, where 0 <= WhiteKeyIndex < 52
  function drawBlackKey(whiteKeyIndex) {
    C1 = "rgb(0,0,0)"; // black
    C2 = "rgb(50,50,50)"; // ??

    DrawRectWithBorder(
      X_BORDER + (whiteKeyIndex + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2,
      Y_BORDER,
      BLACK_KEY_WIDTH,
      BLACK_KEY_HEIGHT,
      C1,
      C2
    );

    addKeyToArray(blackKeys, true, whiteKeyIndex);
  }

  function DrawWhiteKey(WhiteKeyIndex) {
    C1 = "rgb(0,0,0)"; // lback
    C2 = "rgb(255,255,255)"; // white

    DrawRectWithBorder(
      X_BORDER + WhiteKeyIndex * WHITE_KEY_WIDTH,
      Y_BORDER,
      WHITE_KEY_WIDTH,
      height,
      C1,
      C2
    );

    addKeyToArray(whiteKeys, false, WhiteKeyIndex);
  }

  function addKeyToArray(notesArray, isBlack, WhiteKeyIndex) {
    let key_width = isBlack ? BLACK_KEY_WIDTH : WHITE_KEY_WIDTH;
    let key_height = isBlack ? BLACK_KEY_HEIGHT : WHITE_KEY_HEIGHT;
    let x = isBlack
      ? X_BORDER + (WhiteKeyIndex + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2
      : X_BORDER + WhiteKeyIndex * WHITE_KEY_WIDTH;

    notesArray.push({
      x: x,
      y: Y_BORDER,
      width: key_width,
      height: key_height,
      isBlack: isBlack,
      index: null,
    });
  }

  // just draw in all the white keys to begin with...
  for (i = 0; i < NUM_WHITE_KEYS; i++) {
    DrawWhiteKey(i);
  }
  // draw first black key that is not from an octave
  drawBlackKey(0);

  // now draw all the rest of the black keys...
  // loop through all 7 octaves
  numOctaves = 7;
  curWhiteNoteIndex = 2;

  for (octave = 0; octave < numOctaves; octave++) {
    // and draw 5 black notes per octave...
    for (i = 0; i < 5; i++) {
      drawBlackKey(curWhiteNoteIndex);
      if (i == 1 || i == 4) curWhiteNoteIndex += 2;
      else curWhiteNoteIndex += 1;
    }
  }

  function assignMidiNumbers() {
    var midiNumber = 21;
    var blackKeyIndex = 1;
    var blackKeyPattern = [true, true, false, true, true, true, false];

    // Assign MIDI numbers to the first three keys
    whiteKeys[0].index = midiNumber++;
    keys.push(whiteKeys[0]);

    blackKeys[0].index = midiNumber++;
    keys.push(blackKeys[0]);

    whiteKeys[1].index = midiNumber++;
    keys.push(whiteKeys[1]);

    // Assign MIDI numbers to the rest of the keys
    for (var i = 2; i < 52; i++) {
      whiteKeys[i].index = midiNumber++;
      keys.push(whiteKeys[i]);

      // Add a black key according to the pattern
      if (
        blackKeyPattern[(i - 2) % blackKeyPattern.length] &&
        blackKeyIndex < blackKeys.length
      ) {
        blackKeys[blackKeyIndex].index = midiNumber++;
        keys.push(blackKeys[blackKeyIndex]);
        blackKeyIndex++;
      }
    }
  }

  assignMidiNumbers();

  //Sort it just bc white key are bigger so their "hitbox" can overlap black keys
  keys.sort(function (a, b) {
    return b.isBlack - a.isBlack;
  });

  canvas.addEventListener("click", function (event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (
        x >= key.x &&
        x <= key.x + key.width &&
        y >= key.y &&
        y <= key.y + key.height
      ) {
        console.log("Key clicked:", key.index, "Is black:", key.isBlack);
        break;
      }
    }
  });
}
