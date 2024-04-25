class KeyType {
  constructor(isBlack, White_Index) {
    this.isBlack = isBlack;
    this.White_Index = White_Index;
  }
}

class Keyboard {
  constructor(canvas, coloredKeysParam = {}) {
    this.canvas = canvas;
    this.coloredKeys = coloredKeysParam;
    this.firstKeyIndex = null;
    this.whiteKeys = [];
    this.blackKeys = [];
    this.keys = [];

    this.TOTAL_KEYS = 88;
    this.NUM_WHITE_KEYS = 52;
    this.MIDI_DISPLACEMENT = 21;

    this.ctx = canvas.getContext("2d");

    this.X_BORDER = 0;
    this.Y_BORDER = 0;

    this.width = canvas.width - this.X_BORDER * 2;
    this.height = canvas.height - this.Y_BORDER * 2;

    this.WHITE_KEY_WIDTH = this.width / this.NUM_WHITE_KEYS;
    this.WHITE_KEY_HEIGHT = this.height;

    this.BLACK_KEY_WIDTH = this.WHITE_KEY_WIDTH * 0.75;
    this.BLACK_KEY_HEIGHT = this.height * 0.66;

    this.drawDefaultKeyboard();
    this.setupEventListeners();
  }

  //Public
  drawDefaultKeyboard() {
    // just draw in all the white keys to begin with...
    for (let i = 0; i < this.NUM_WHITE_KEYS; i++) {
      this.drawWhiteKey(i, false, false, true);
    }
    // draw first black key that is not from an octave
    this.drawBlackKey(0, false, false, true);

    // now draw all the rest of the black keys...
    // loop through all 7 octaves
    const numOctaves = 7;
    let curWhiteNoteIndex = 2;

    for (let octave = 0; octave < numOctaves; octave++) {
      // and draw 5 black notes per octave...
      for (let i = 0; i < 5; i++) {
        this.drawBlackKey(curWhiteNoteIndex, false, false, true);
        if (i == 1 || i == 4) curWhiteNoteIndex += 2;
        else curWhiteNoteIndex += 1;
      }
    }
    this.sortKeys();
    this.assignMidiNumbers();
  }

  resetColoredKeys() {
    this.coloredKeys = {};
  }

  //Private

  DrawRectWithBorder(X, Y, Width, Height, Color1, Color2) {
    //draw border
    this.ctx.fillStyle = Color1;
    this.ctx.fillRect(X, Y, Width, Height);

    //draw inside
    this.ctx.fillStyle = Color2;
    this.ctx.fillRect(X + 1, Y + 1, Width - 2, Height - 2);
  }

  drawBlackKey(
    whiteKeyIndex,
    coloredKey = false,
    mappedKey = false,
    defaultDraw = false
  ) {
    let C1, C2;
    C1 = "#000000"; // black
    C2 = "#323232"; // grey
    if (coloredKey) {
      if (mappedKey) C2 = "#4663ac";
      else C2 = "#c1d8f0";
    }
    this.DrawRectWithBorder(
      this.X_BORDER +
        (whiteKeyIndex + 1) * this.WHITE_KEY_WIDTH -
        this.BLACK_KEY_WIDTH / 2,
      this.Y_BORDER,
      this.BLACK_KEY_WIDTH,
      this.BLACK_KEY_HEIGHT,
      C1,
      C2
    );
    if (defaultDraw) this.addKeyToArray(this.blackKeys, true, whiteKeyIndex);
  }

  drawWhiteKey(
    WhiteKeyIndex,
    coloredKey = false,
    mappedKey = false,
    defaultDraw = false
  ) {
    let C1, C2;
    C1 = "#000000"; // black
    C2 = "#ffffff"; // white
    if (coloredKey) {
      if (mappedKey) C2 = "#4663ac";
      else C2 = "#c1d8f0";
    }

    this.DrawRectWithBorder(
      this.X_BORDER + WhiteKeyIndex * this.WHITE_KEY_WIDTH,
      this.Y_BORDER,
      this.WHITE_KEY_WIDTH,
      this.height,
      C1,
      C2
    );
    if (defaultDraw) this.addKeyToArray(this.whiteKeys, false, WhiteKeyIndex);
  }

  addKeyToArray(notesArray, isBlack, WhiteKeyIndex) {
    let key_width = isBlack ? this.BLACK_KEY_WIDTH : this.WHITE_KEY_WIDTH;
    let key_height = isBlack ? this.BLACK_KEY_HEIGHT : this.WHITE_KEY_HEIGHT;
    let x = isBlack
      ? this.X_BORDER +
        (WhiteKeyIndex + 1) * this.WHITE_KEY_WIDTH -
        this.BLACK_KEY_WIDTH / 2
      : this.X_BORDER + WhiteKeyIndex * this.WHITE_KEY_WIDTH;

    notesArray.push({
      x: x,
      y: this.Y_BORDER,
      width: key_width,
      height: key_height,
      isBlack: isBlack,
      index: null,
    });
  }

  AbsoluteToKeyInfo(AbsoluteNoteNum) {
    let KeyLookupTable = new Array(this.TOTAL_KEYS);

    KeyLookupTable[0] = new KeyType(false, 0); // a
    KeyLookupTable[1] = new KeyType(true, 0); // a#
    KeyLookupTable[2] = new KeyType(false, 1); // b
    let base = 3;

    let NumOctaves = 8;
    for (let counter = 0; counter < NumOctaves; counter++) {
      let octave_offset = 7 * counter;

      KeyLookupTable[base + 0] = new KeyType(false, octave_offset + 2); // c
      KeyLookupTable[base + 1] = new KeyType(true, octave_offset + 2); // c#
      KeyLookupTable[base + 2] = new KeyType(false, octave_offset + 3); // d
      KeyLookupTable[base + 3] = new KeyType(true, octave_offset + 3); // d#
      KeyLookupTable[base + 4] = new KeyType(false, octave_offset + 4); // e
      KeyLookupTable[base + 5] = new KeyType(false, octave_offset + 5); // f
      KeyLookupTable[base + 6] = new KeyType(true, octave_offset + 5); // f#
      KeyLookupTable[base + 7] = new KeyType(false, octave_offset + 6); // g
      KeyLookupTable[base + 8] = new KeyType(true, octave_offset + 6); // g#
      KeyLookupTable[base + 9] = new KeyType(false, octave_offset + 7); // a
      KeyLookupTable[base + 10] = new KeyType(true, octave_offset + 7); // a#
      KeyLookupTable[base + 11] = new KeyType(false, octave_offset + 8); // b

      base += 12;
    }

    return KeyLookupTable[AbsoluteNoteNum];
  }

  reDrawNeighbourBlackKeys(whiteIndex) {
    switch (true) {
      case whiteIndex === 0:
        break;
      case whiteIndex === 1:
        this.drawBlackKey(whiteIndex - 1, false);
        break;
      case whiteIndex > 0 && whiteIndex < 51:
        let positionInOctave = (whiteIndex - 2) % 7;

        switch (positionInOctave) {
          case 0: // Do
            this.drawBlackKey(whiteIndex, false);
            break;
          case 1: // Re
          case 4: // Sol
          case 5: // La
            this.drawBlackKey(whiteIndex, false);
            this.drawBlackKey(whiteIndex - 1, false);
            break;
          case 2: // Mi
          case 6: // Si
            this.drawBlackKey(whiteIndex - 1, false);
            break;
          case 3: // Fa
            this.drawBlackKey(whiteIndex, false);
            break;
        }
        break;
      default:
        break;
    }
  }

  colorKeys(pressedKey) {
    let test = [];
    for (let key in this.coloredKeys) {
      if (String(pressedKey) !== key) {
        continue;
      }

      let keyInfo = this.AbsoluteToKeyInfo(
        parseInt(key) - this.MIDI_DISPLACEMENT
      );
      if (keyInfo.isBlack) {
        test.push({ info: keyInfo, keyBeingMap: true });
      } else {
        this.drawWhiteKey(keyInfo.White_Index, true, true);
        this.reDrawNeighbourBlackKeys(keyInfo.White_Index);
      }

      let associatedKeyNums = this.coloredKeys[key];
      for (let associatedKeyNum of associatedKeyNums) {
        let associatedKeyInfo = this.AbsoluteToKeyInfo(
          associatedKeyNum - this.MIDI_DISPLACEMENT
        );
        if (associatedKeyInfo.isBlack) {
          test.push({ info: associatedKeyInfo, keyBeingMap: false });
        } else {
          this.drawWhiteKey(associatedKeyInfo.White_Index, true);
          this.reDrawNeighbourBlackKeys(associatedKeyInfo.White_Index);
        }
      }
    }
    for (let key of test) {
      this.drawBlackKey(key.info.White_Index, true, key.keyBeingMap);
    }
    //TODO FIX THE REDRAWING OF NAMES
    this.assignMidiNumbers();
  }

  drawText(x, y, text, color = "black") {
    var ctx = document.getElementById("canvas").getContext("2d");
    ctx.font = "14px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }

  assignMidiNumbers() {
    var midiNumber = 21;
    var blackKeyIndex = 1;
    var blackKeyPattern = [true, true, false, true, true, true, false];

    // Assign MIDI numbers to the first three keys
    this.whiteKeys[0].index = midiNumber++;
    this.keys.push(this.whiteKeys[0]);
    this.drawText(
      this.whiteKeys[0].x + this.WHITE_KEY_WIDTH / 2,
      this.whiteKeys[0].y + this.WHITE_KEY_HEIGHT / 1.2,
      this.midiToNoteName(this.whiteKeys[0].index)
    );

    this.blackKeys[0].index = midiNumber++;
    this.keys.push(this.blackKeys[0]);
    this.drawText(
      this.blackKeys[0].x + this.BLACK_KEY_WIDTH / 2,
      this.blackKeys[0].y + this.BLACK_KEY_HEIGHT / 1.2,
      this.midiToNoteName(this.blackKeys[0].index),
      "white"
    );

    this.whiteKeys[1].index = midiNumber++;
    this.keys.push(this.whiteKeys[1]);
    this.drawText(
      this.whiteKeys[1].x + this.WHITE_KEY_WIDTH / 2,
      this.whiteKeys[1].y + this.WHITE_KEY_HEIGHT / 1.2,
      this.midiToNoteName(this.whiteKeys[1].index)
    );

    // Assign MIDI numbers to the rest of the keys
    for (let i = 2; i < 52; i++) {
      this.whiteKeys[i].index = midiNumber++;
      this.keys.push(this.whiteKeys[i]);
      this.drawText(
        this.whiteKeys[i].x + this.WHITE_KEY_WIDTH / 2,
        this.whiteKeys[i].y + this.WHITE_KEY_HEIGHT / 1.2,
        this.midiToNoteName(this.whiteKeys[i].index)
      );

      // Add a black key according to the pattern
      if (
        blackKeyPattern[(i - 2) % blackKeyPattern.length] &&
        blackKeyIndex < this.blackKeys.length
      ) {
        this.blackKeys[blackKeyIndex].index = midiNumber++;
        this.keys.push(this.blackKeys[blackKeyIndex]);
        this.drawText(
          this.blackKeys[blackKeyIndex].x + this.BLACK_KEY_WIDTH / 2,
          this.blackKeys[blackKeyIndex].y + this.BLACK_KEY_HEIGHT / 1.2,
          this.midiToNoteName(this.blackKeys[blackKeyIndex].index),
          "white"
        );
        blackKeyIndex++;
      }
    }
  }

  sortKeys() {
    this.keys.sort(function (a, b) {
      return b.isBlack - a.isBlack;
    });
  }

  setupEventListeners() {
    console.log("Setting up event listeners");
    this.canvas.addEventListener("click", (event) => {
      event.stopPropagation();
      let rect = this.canvas.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;

      for (let i = 0; i < this.keys.length; i++) {
        let key = this.keys[i];
        if (
          x >= key.x &&
          x <= key.x + key.width &&
          y >= key.y &&
          y <= key.y + key.height
        ) {
          console.log(key.index);
          if (this.firstKeyIndex === null) {
            this.firstKeyIndex = key.index;
            if (!this.coloredKeys.hasOwnProperty(this.firstKeyIndex)) {
              this.coloredKeys[this.firstKeyIndex] = new Set();
            }
          } else {
            this.coloredKeys[this.firstKeyIndex].add(key.index);
          }
          this.colorKeys(this.firstKeyIndex);
          break;
        }
      }
    });

    document.addEventListener("click", (event) => {
      let rect = this.canvas.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        this.firstKeyIndex = null;
        this.drawDefaultKeyboard();
      }
    });
  }

  midiToNoteName(midiNumber) {
    let noteNames = [
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
    let octave = Math.floor(midiNumber / 12) - 1;
    let noteIndex = midiNumber % 12;
    return noteNames[noteIndex] + octave;
  }
}