const cp = require('child_process');
const path = require("path");
const player = require('play-sound')();

const _isWindows = process.platform === 'win32'
const _playerWindowsPath = path.join(__dirname, '..', '..', 'audio', 'play.exe');

export default {
  play (note: string, instrument: string = 'piano') : Promise<void> {
    return new Promise ((resolve, reject) => {
      const instrumentPath = 'acoustic_grand_piano-mp3'; // ignore drum instrument
      const filePath = `${__dirname}/../../audio/${instrumentPath}/${note}.mp3`;
      if (_isWindows) {
        cp.execFile(_playerWindowsPath, [filePath]);
      } else {
        player.play(filePath, err => {
          if (err) {
            console.error(err);
            return reject(err);
          }
          resolve();
        });
      }
    });
  }

}