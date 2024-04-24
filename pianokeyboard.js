function DrawKeyboard(canvas, coloredKeys = {}) {
  // general characteristics of a piano

  let firstKeyIndex = null;
  let whiteKeys = [];
  let blackKeys = [];
  let keys = [];

  let TOTAL_KEYS = 88;
  let NUM_WHITE_KEYS = 52;
  const MIDI_DISPLACEMENT = 21;

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
  function drawBlackKey(whiteKeyIndex, coloredKey = false, mappedKey = false) {
    let C1, C2;
    C1 = "#000000"; // black
    C2 = "#323232"; // grey
    if (coloredKey) {
      if (mappedKey) C2 = "#4663ac";
      else C2 = "#c1d8f0";
    }
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

  function drawWhiteKey(WhiteKeyIndex, coloredKey = false, mappedKey = false) {
    let C1, C2;
    C1 = "#000000"; // black
    C2 = "#ffffff"; // white
    if (coloredKey) {
      if (mappedKey) C2 = "#4663ac";
      else C2 = "#c1d8f0";
    }

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

  function keyType(isBlack, White_Index) {
    this.isBlack = isBlack;
    this.White_Index = White_Index;
  }

  function AbsoluteToKeyInfo(AbsoluteNoteNum) {
    var KeyLookupTable = new Array(TOTAL_KEYS);

    KeyLookupTable[0] = new keyType(false, 0); // a
    KeyLookupTable[1] = new keyType(true, 0); // a#
    KeyLookupTable[2] = new keyType(false, 1); // b
    base = 3;

    NumOctaves = 8;
    for (counter = 0; counter < NumOctaves; counter++) {
      octave_offset = 7 * counter;

      KeyLookupTable[base + 0] = new keyType(false, octave_offset + 2); // c
      KeyLookupTable[base + 1] = new keyType(true, octave_offset + 2); // c#
      KeyLookupTable[base + 2] = new keyType(false, octave_offset + 3); // d
      KeyLookupTable[base + 3] = new keyType(true, octave_offset + 3); // d#
      KeyLookupTable[base + 4] = new keyType(false, octave_offset + 4); // e
      KeyLookupTable[base + 5] = new keyType(false, octave_offset + 5); // f
      KeyLookupTable[base + 6] = new keyType(true, octave_offset + 5); // f#
      KeyLookupTable[base + 7] = new keyType(false, octave_offset + 6); // g
      KeyLookupTable[base + 8] = new keyType(true, octave_offset + 6); // g#
      KeyLookupTable[base + 9] = new keyType(false, octave_offset + 7); // a
      KeyLookupTable[base + 10] = new keyType(true, octave_offset + 7); // a#
      KeyLookupTable[base + 11] = new keyType(false, octave_offset + 8); // b

      base += 12;
    }

    return KeyLookupTable[AbsoluteNoteNum];
  }

  function reDrawNeighbourBlackKeys(whiteIndex) {
    switch (true) {
      case whiteIndex === 0:
        break;
      case whiteIndex === 1:
        drawBlackKey(whiteIndex - 1, false);
        break;
      case whiteIndex > 0 && whiteIndex < 51:
        let positionInOctave = (whiteIndex - 2) % 7;

        switch (positionInOctave) {
          case 0: // Do
            drawBlackKey(whiteIndex, false);
            break;
          case 1: // Re
          case 4: // Sol
          case 5: // La
            drawBlackKey(whiteIndex, false);
            drawBlackKey(whiteIndex - 1, false);
            break;
          case 2: // Mi
          case 6: // Si
            drawBlackKey(whiteIndex - 1, false);
            break;
          case 3: // Fa
            drawBlackKey(whiteIndex, false);
            break;
        }
        break;
      default:
        break;
    }
  }

  function colorKeys(pressedKey) {
    console.log(coloredKeys);
    let test = [];
    for (let key in coloredKeys) {
      if (String(pressedKey) !== key) {
        continue;
      }

      let keyInfo = AbsoluteToKeyInfo(parseInt(key) - MIDI_DISPLACEMENT);
      if (keyInfo.isBlack) {
        test.push({ info: keyInfo, keyBeingMap: true });
      } else {
        drawWhiteKey(keyInfo.White_Index, true, true);
        reDrawNeighbourBlackKeys(keyInfo.White_Index);
      }

      let associatedKeyNums = coloredKeys[key];
      for (let associatedKeyNum of associatedKeyNums) {
        let associatedKeyInfo = AbsoluteToKeyInfo(
          associatedKeyNum - MIDI_DISPLACEMENT
        );
        if (associatedKeyInfo.isBlack) {
          test.push({ info: associatedKeyInfo, keyBeingMap: false });
        } else {
          drawWhiteKey(associatedKeyInfo.White_Index, true);
          reDrawNeighbourBlackKeys(associatedKeyInfo.White_Index);
        }
      }
    }
    for (let key of test) {
      drawBlackKey(key.info.White_Index, true, key.keyBeingMap);
    }
    //TODO FIX THE REDRAWING OF NAMES
    assignMidiNumbers();
  }

  function drawText(x, y, text, color = "black") {
    var ctx = document.getElementById("canvas").getContext("2d");
    ctx.font = "14px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }

  function assignMidiNumbers() {
    var midiNumber = 21;
    var blackKeyIndex = 1;
    var blackKeyPattern = [true, true, false, true, true, true, false];

    // Assign MIDI numbers to the first three keys
    whiteKeys[0].index = midiNumber++;
    keys.push(whiteKeys[0]);
    drawText(
      whiteKeys[0].x + WHITE_KEY_WIDTH / 2,
      whiteKeys[0].y + WHITE_KEY_HEIGHT / 1.2,
      midiToNoteName(whiteKeys[0].index)
    );

    blackKeys[0].index = midiNumber++;
    keys.push(blackKeys[0]);
    drawText(
      blackKeys[0].x + BLACK_KEY_WIDTH / 2,
      blackKeys[0].y + BLACK_KEY_HEIGHT / 1.2,
      midiToNoteName(blackKeys[0].index),
      "white"
    );

    whiteKeys[1].index = midiNumber++;
    keys.push(whiteKeys[1]);
    drawText(
      whiteKeys[1].x + WHITE_KEY_WIDTH / 2,
      whiteKeys[1].y + WHITE_KEY_HEIGHT / 1.2,
      midiToNoteName(whiteKeys[1].index)
    );

    // Assign MIDI numbers to the rest of the keys
    for (var i = 2; i < 52; i++) {
      whiteKeys[i].index = midiNumber++;
      keys.push(whiteKeys[i]);
      drawText(
        whiteKeys[i].x + WHITE_KEY_WIDTH / 2,
        whiteKeys[i].y + WHITE_KEY_HEIGHT / 1.2,
        midiToNoteName(whiteKeys[i].index)
      );

      // Add a black key according to the pattern
      if (
        blackKeyPattern[(i - 2) % blackKeyPattern.length] &&
        blackKeyIndex < blackKeys.length
      ) {
        blackKeys[blackKeyIndex].index = midiNumber++;
        keys.push(blackKeys[blackKeyIndex]);
        drawText(
          blackKeys[blackKeyIndex].x + BLACK_KEY_WIDTH / 2,
          blackKeys[blackKeyIndex].y + BLACK_KEY_HEIGHT / 1.2,
          midiToNoteName(blackKeys[blackKeyIndex].index),
          "white"
        );
        blackKeyIndex++;
      }
    }
  }

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
        if (firstKeyIndex === null) {
          firstKeyIndex = key.index;
          if (!coloredKeys.hasOwnProperty(firstKeyIndex)) {
            coloredKeys[firstKeyIndex] = new Set();
          }
        } else {
          coloredKeys[firstKeyIndex].add(key.index);
        }
        colorKeys(firstKeyIndex);
        break;
      }
    }
  });

  document.addEventListener("click", function (event) {
    let rect = canvas.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      firstKeyIndex = null;
      drawDefaultKeyboard();
    }
  });

  function midiToNoteName(midiNumber) {
    var noteNames = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    var octave = Math.floor(midiNumber / 12) - 1;
    var noteIndex = midiNumber % 12;
    return noteNames[noteIndex] + octave;
  }

  function drawDefaultKeyboard() {
    // just draw in all the white keys to begin with...
    for (i = 0; i < NUM_WHITE_KEYS; i++) {
      drawWhiteKey(i);
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

    assignMidiNumbers();
  }

  drawDefaultKeyboard();
}
