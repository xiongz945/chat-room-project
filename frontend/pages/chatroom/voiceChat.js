import { sendPrivateMessage, sendPublicMessage } from './chatroom.js';
import userStore from '../../store/user.js';

let recoding = false;
let recorder = null;

const recordAudio = () => {
  return new Promise((resolve) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const options = {
        audioBitsPerSecond: 128000,
        mimeType: 'audio/webm',
      };
      const mediaRecorder = new MediaRecorder(stream, options);
      const audioChunks = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });

      const start = () => {
        mediaRecorder.start();
      };

      const stop = () => {
        return new Promise((resolve) => {
          mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            const mimeType = mediaRecorder.mimeType;
            const play = () => {
              audio.play();
            };

            resolve({ audioBlob, audioUrl, play, mimeType });
          });

          mediaRecorder.stop();
        });
      };

      resolve({ start, stop });
    });
  });
};

document
  .querySelector('#record')
  .addEventListener('click', () => recordAudioMessage());

async function recordAudioMessage() {
  if (recoding === false) recorder = await recordAudio();

  if (recoding === false) {
    recorder.start();
    document.querySelector('#record').innerText = 'Recording...';
    recoding = true;
  } else {
    const audio = await recorder.stop();
    console.log(audio, audio.audioBlob);
    // audio.play();

    if (userStore.userGetters.chatMode() == 'public') {
      sendPublicMessage(audio.audioBlob);
    } else {
      sendPrivateMessage(audio.audioBlob);
    }

    document.querySelector('#record').innerText = 'Press to record voice';
    recoding = false;
  }
}
