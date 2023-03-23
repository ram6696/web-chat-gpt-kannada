'use strict';
let chatHistory = [];
const socket = io();
const outputYou = document.querySelector('.output-you');
const outputBot = document.querySelector('.output-bot');
const button = document.getElementById('microphoneId')
const chatsElement = document.getElementById("chats")
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
var audioPlayer = document.getElementById("audioPlayer")
let botReplay;
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = new AudioContext();
let track;
track = audioCtx.createBufferSource();
const media = $('audio');
function copyaa(src)  {
  var dst = new ArrayBuffer(src.byteLength);
  new Uint8Array(dst).set(new Uint8Array(src));
  return dst;
}
const audioTag = document.getElementById('audio');
// const context = new AudioContext();
// const source = context.createBufferSource();
function microPhoneClicked () {
  outputYou.textContent = "Speak..."
  if (!audioTag.paused) {
    togglePlay()
  }
  audioPlayer.className = "hideBlock";
  button.style = "background: #ff6464;";
}
function listenStarted () {
  audioPlayer.className = "hideBlock";
  outputYou.textContent = "Listening..."
  outputBot.textContent = "...";
  button.style = "background: #ff6464;";
}
function listenEnded () {
  audioPlayer.className = "hideBlock";
  button.style = "background: linear-gradient(180deg, #39C2C9 0%, #3FC8C9 80%, #3FC8C9 100%)";
}

function togglePlayButton (audio, isPlay) {
  if (isPlay) {
    audio.play();
  } else {
    audio.pause();
  }
}

const getPlaybutton = (audio) => {
  let playButton = document.createElement("span");
  let pauseButton = document.createElement("span");
  playButton.innerHTML = '&#9658;';
  pauseButton.innerHTML = "pause";
  playButton.addEventListener('click', () => {
    togglePlayButton(audio, true);
  });
  pauseButton.addEventListener('click', () => {
    togglePlayButton(audio, false);
  });
  return playButton;
}
const createChatList = () => {
  chatsElement.innerHTML = "";
  let chatElement = ""
  chatHistory.forEach( (value, index) => {
    let div = document.createElement("div");
    let span = document.createElement("span");
    let em = document.createElement("em");
    if (value.isBot) {
      div.className = "chatNode";
      span.className = "botReply";
      em.className = "fas fa-robot"
      div.appendChild(em);
      div.appendChild(span);
    } else {
      div.className = "chatNode chatRight";
      span.className = "input";
      em.className = "fas fa-user-alt"
      div.appendChild(span);
      div.appendChild(em);
    }
    span.innerHTML = value.chat;
    chatsElement.appendChild(div)
  })
}

socket.on("startConversations", function(json) {
  chatHistory = json;
  createChatList();
})
recognition.lang = 'kn';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

document.querySelector('.microphone').addEventListener('click', () => {
  // button.style.backgroundColor = "red";
  recognition.start();
  microPhoneClicked();
});

recognition.addEventListener('speechstart', () => {
  console.log('Speech has been detected.');
  listenStarted();
});

recognition.addEventListener('result', (e) => {
  console.log('Result has been detected.');

  let last = e.results.length - 1;
  let text = e.results[last][0].transcript;

  outputYou.textContent = text;
  console.log('Confidence: ' + e.results[0][0].confidence);
  listenEnded();
  socket.emit('chat message', text);
});

recognition.addEventListener('speechend', () => {
  listenEnded();
  recognition.stop();
});

recognition.addEventListener('error', (e) => {
  outputYou.textContent = "Try again."
  listenEnded();
  outputBot.textContent = 'Error: ' + e.error;
});

function synthVoice(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = 'ಕೃಷ್ಣ ಅವರ';
  utterance.lang = 'kn-IN';
  const voices = synth.getVoices();
  const kannadaVoice = voices.find(voice => voice.lang === "kn-IN");
  utterance.voice = kannadaVoice;
  synth.speak(utterance);
}

function playAudioFromBuffer(replyText) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioCtx = new AudioContext();
  var audioFile = audioCtx.decodeAudioData(replyText).then(buffer => {
    var track = audioCtx.createBufferSource();
    track.buffer = buffer;
    track.connect(audioCtx.destination);
    track.start(0);
  });
}

socket.on('conversations', function (json) {
  chatHistory = json;
  createChatList();
})

socket.on('audio reply', function(replyText) {
  console.log(replyText)
  botReplay = replyText;
  audio.load();
  audioPlayer.className = "audio-player";
  setTimeout(() =>  {
    togglePlay()
  }, 2000);
})

socket.on('bot reply', function(replyText) {
  // synthVoice(replyText);

  if(replyText == '') replyText = '(No answer...)';
  outputBot.textContent = replyText;
});
//
// function playyy () {
// // Create an audio context
//   const audioContext = new AudioContext();
//
// // Define the source node and buffer
//   let sourceNode, progressTimer;
//   let buffer, pausedTime, startTime = 0;
//
// // Decode the array buffer
//   audioContext.decodeAudioData(botReplay)
//       .then((decodedData) => {
//         // Store the buffer for later use
//         buffer = decodedData;
//       })
//       .catch((err) => {
//         console.log('Error decoding audio data:', err);
//       });
//
// // Define the play, pause, stop, resume, and restart functions
//   function play() {
//     console.log(audioContext.destination)
//     if (!sourceNode) {
//       // Create a new source node
//       sourceNode = audioContext.createBufferSource();
//       sourceNode.buffer = buffer;
//       console.log(sourceNode)
//       // Connect the source node to the destination (output)
//       sourceNode.connect(audioContext.destination);
//     }
//
//     // Resume the playback if it's paused, otherwise start from the beginning
//     if (audioContext.state === 'suspended') {
//       audioContext.resume();
//     } else {
//       sourceNode.start();
//     }
//
//     progressTimer = setInterval(updateProgress, 50);
//   }
//
//   function pause() {
//     console.log(audioContext)
//     console.log(sourceNode)
//     console.log(audioContext.currentTime)
//     if (sourceNode) {
//       pausedTime = audioContext.currentTime - startTime;
//       audioContext.suspend()
//       clearInterval(progressTimer);
//       // sourceNode.stop();
//     }
//   }
//
//   function stop() {
//     if (sourceNode) {
//       sourceNode.stop();
//       sourceNode.disconnect();
//       sourceNode = null;
//       cancelAnimationFrame(animationId);
//       clearInterval(progressTimer);
//     }
//   }
//
//   function resume() {
//     if (audioContext.state === 'suspended') {
//       audioContext.resume();
//       progressTimer = setInterval(updateProgress, 50);
//     } else if (sourceNode && audioContext.state === 'running' && sourceNode.playbackState === sourceNode.SUSPENDED_STATE) {
//       // Resume the playback if it's paused
//       sourceNode.start(0, sourceNode.context.currentTime - pausedTime);
//       progressTimer = setInterval(updateProgress, 50);
//     } else {
//       // Start the playback from the beginning
//       play();
//       progressTimer = setInterval(updateProgress, 50);
//     }
//   }
//
//   function restart() {
//     stop();
//     play();
//   }
//   function updateProgress() {
//     const progressBar = document.querySelector('#progress');
//     if (sourceNode) {
//       const currentTime = audioContext.currentTime - startTime;
//       progressBar.value = currentTime / audioBuffer.duration * 100;
//     } else {
//       progressBar.value = 0;
//     }
//   }
//   const progressBar = document.querySelector('#progress');
//   progressBar.addEventListener('input', () => {
//     if (sourceNode) {
//       const currentTime = progressBar.value / 100 * audioBuffer.duration;
//       sourceNode.stop();
//       sourceNode = null;
//       pausedTime = currentTime;
//       play();
//     }
//   });
//   // function formatTime(time) {
//   //   const minutes = Math.floor(time / 60);
//   //   const seconds = Math.floor(time % 60);
//   //   const secondsFormatted = seconds < 10 ? `0${seconds}` : seconds;
//   //   return `${minutes}:${secondsFormatted}`;
//   // }
//   // function updateProgress() {
//   //   const progressElement = document.querySelector('#progress');
//   //   const currentTimeElement = document.querySelector('#currentTime');
//   //   const durationElement = document.querySelector('#duration');
//   //   if (!sourceNode) {
//   //     progressElement.style.width = '0%';
//   //     currentTimeElement.textContent = '00:00';
//   //     durationElement.textContent = '00:00';
//   //     return;
//   //   }
//   //   const progress = (audioContext.currentTime - startTime + pausedTime) / audioBuffer.duration;
//   //   progressElement.style.width = `${Math.floor(progress * 100)}%`;
//   //   currentTimeElement.textContent = formatTime(audioContext.currentTime - startTime + pausedTime);
//   //   durationElement.textContent = formatTime(audioBuffer.duration);
//   //   animationId = requestAnimationFrame(updateProgress);
//   // }
//
// // Get the buttons and add event listeners to them
//   const playBtn = document.getElementById('play-btn');
//   const pauseBtn = document.getElementById('pause-btn');
//   const stopBtn = document.getElementById('stop-btn');
//   const resumeBtn = document.getElementById('resume-btn');
//   const restartBtn = document.getElementById('restart-btn');
//
//   playBtn.addEventListener('click', play);
//   pauseBtn.addEventListener('click', pause);
//   stopBtn.addEventListener('click', stop);
//   resumeBtn.addEventListener('click', resume);
//   restartBtn.addEventListener('click', restart);
// }

// function audioPlayer () {
  function $(id) { return document.getElementById(id); };

  let ui = {
    play: 'playAudio',
    audio: 'audio',
    percentage: 'percentage',
    seekObj: 'seekObj',
    currentTime: 'currentTime'
  };
  function togglePlay() {
    if (media.paused === false) {
      media.pause();
      $(ui.play).classList.remove('pause');
    } else {
      media.play();
      $(ui.play).classList.add('pause');
    }
  }

  function calculatePercentPlayed() {
    let percentage = (media.currentTime / media.duration).toFixed(2) * 100;
    $(ui.percentage).style.width = `${percentage}%`;
  }

  function calculateCurrentValue(currentTime) {
    const currentMinute = parseInt(currentTime / 60) % 60;
    const currentSecondsLong = currentTime % 60;
    const currentSeconds = currentSecondsLong.toFixed();
    const currentTimeFormatted = `${currentMinute < 10 ? `0${currentMinute}` : currentMinute}:${
        currentSeconds < 10 ? `0${currentSeconds}` : currentSeconds
    }`;

    return currentTimeFormatted;
  }

  function initProgressBar() {
    const currentTime = calculateCurrentValue(media.currentTime);
    $(ui.currentTime).innerHTML = currentTime;
    $(ui.seekObj).addEventListener('click', seek);

    media.onended = () => {
      $(ui.play).classList.remove('pause');
      $(ui.percentage).style.width = 0;
      $(ui.currentTime).innerHTML = '00:00';
    };

    function seek(e) {
      const percent = e.offsetX / this.offsetWidth;
      media.currentTime = percent * media.duration;
    }

    calculatePercentPlayed();
  }

  $(ui.play).addEventListener('click', togglePlay)
  $(ui.audio).addEventListener('timeupdate', initProgressBar);
// }