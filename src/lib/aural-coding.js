import player from './player'

export default class AuralCoding {

  constructor() {
    let noteName;
    this.firstKey = 0x15;
    this.lastKey = 0x6C;
    this.noteNames = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    this.player = player
    this.keys = {};
    this.drums = {};
    this.sources = {};
    this.keyForNoteName = {};
    this.noteForKey = {};
    this.allNoteNames = [];

    for (let key = this.firstKey, end = this.lastKey, asc = this.firstKey <= end; asc ? key < end : key > end; asc ? key++ : key--) {
      const octave = Math.floor((key - 12) / 12);
      noteName = this.noteNames[key % 12] + octave;
      this.allNoteNames.push(noteName);
      this.keyForNoteName[noteName] = key;
      this.noteForKey[key] = noteName;
    }

    this.majorScaleNotes = __range__(this.firstKey, this.lastKey, false).filter((key, index) => {
      return [0, 2, 4, 5, 7, 9, 11].includes(((index + 4) % 12));
    }); // C Major Scale. (I think?)

    for (const noteName of Array.from(this.allNoteNames)) {
      this.keys[this.keyForNoteName[noteName]] = noteName
      this.drums[this.keyForNoteName[noteName]] = noteName
    }
  }

  bufferForEvent(key, modifiers) {
    let index;
    if (!key) {
      return;
    }

    if (/^[a-z]$/i.test(key)) {
      const keyCode = key.toUpperCase().charCodeAt(0);
      index = 24 + ((keyCode - 'A'.charCodeAt(0)) % 12);
      if (/[A-Z]/.test(key)) {
        index += 12;
      }
      return {
        instrument: 'piano',
        buffer: this.keys[this.majorScaleNotes[index]],
        velocity: 1
      };
    } else {
      let velocity;
      [index, velocity] = Array.from((() => {
        switch (key) {
          case 'backspace':
            return [50, 1];
          case 'delete':
            return [49, 1];
          case 'space':
            return [41, 0.025];
          case '\t':
          case 'tab':
            return [41];
          case '.':
            return [56];
          case '"':
            return [57];
          case '\'':
            return [58];
          case '+':
            return [61];
          case '[':
            return [36];
          case ']':
            return [37];
          case '(':
            return [38];
          case ')':
            return [39];
          case '!':
            return [54, 2];
          default:
            return [45];
        }
      })());

      return {
        instrument: 'drum',
        buffer: this.drums[index],
        velocity: velocity != null ? velocity : 0.2
      };
    }
  }

  async noteOn(event) {
    const {
      key,
      modifiers
    } = this.keystrokeForKeyboardEvent(event);
    if (!key) {
      return;
    }
    const {
      instrument,
      buffer,
      velocity
    } = this.bufferForEvent(key, modifiers);

    if (!isFinite(velocity)) {
      console.error(`${velocity} is not a finite number.`);
      console.error(`key: ${key}`);
      console.error(`modifiers: ${modifiers}`);
    }
    
    if (!buffer) {
      return;
    }
    // if ((this.sources[event.which] != null ? this.sources[event.which].playbackState : undefined) === 2) {
    //   return;
    // }

    return await this.player.play(buffer, instrument)
  }

  noteOff(event) {
    // let source;
    // if (source = this.sources[event.which]) {
    //   this.sources[event.which] = null;
    //   source.gain.linearRampToValueAtTime(1, this.context.currentTime);
    //   source.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5);
    //   return source.stop(this.context.currentTime + 0.6);
    // }
  }

  keystrokeForKeyboardEvent(event) {
    let key;
    const {
      keyIdentifier
    } = event;
    if (keyIdentifier.indexOf('U+') === 0) {
      const hexCharCode = keyIdentifier.slice(2);
      let charCode = parseInt(hexCharCode, 16);
      if (!this.isAscii(charCode) && this.isAscii(event.which)) {
        charCode = event.which;
      }
      key = this.keyFromCharCode(charCode);
    } else {
      key = keyIdentifier.toLowerCase();
    }

    const modifiers = [];
    if (event.ctrlKey) {
      modifiers.push('ctrl');
    }
    if (event.altKey) {
      modifiers.push('alt');
    }
    if (event.shiftKey) {
      // Don't push 'shift' when modifying symbolic characters like '{'
      if (!/^[^A-Za-z]$/.test(key)) {
        modifiers.push('shift');
      }
      // Only upper case alphabetic characters like 'a'
      if (/^[a-z]$/.test(key)) {
        key = key.toUpperCase();
      }
    } else {
      if (/^[A-Z]$/.test(key)) {
        key = key.toLowerCase();
      }
    }

    if (event.metaKey) {
      modifiers.push('cmd');
    }

    if (['meta', 'shift', 'control', 'alt'].includes(key)) {
      key = null;
    }

    return {
      key,
      modifiers
    };
  }

  keyFromCharCode(charCode) {
    switch (charCode) {
      case 8:
        return 'backspace';
      case 9:
        return 'tab';
      case 13:
        return 'enter';
      case 27:
        return 'escape';
      case 32:
        return 'space';
      case 127:
        return 'delete';
      default:
        return String.fromCharCode(charCode);
    }
  }

  isAscii(charCode) {
    return 0 <= charCode && charCode <= 127;
  }
};

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}