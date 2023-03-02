'use strict';

const socket = io();

const outputYou = document.querySelector('.output-you');
const outputBot = document.querySelector('.output-bot');
const button = document.querySelector('button')

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'kn';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

document.querySelector('button').addEventListener('click', () => {
  button.style.backgroundColor = "red";
  recognition.start();
});

recognition.addEventListener('speechstart', () => {
  console.log('Speech has been detected.');
});

recognition.addEventListener('result', (e) => {
  console.log('Result has been detected.');

  let last = e.results.length - 1;
  let text = e.results[last][0].transcript;

  outputYou.textContent = text;
  console.log('Confidence: ' + e.results[0][0].confidence);

  socket.emit('chat message', text);
});

recognition.addEventListener('speechend', () => {
  recognition.stop();
});

recognition.addEventListener('error', (e) => {
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

socket.on('audio reply', function(replyText) {
  playAudioFromBuffer(replyText);
})

socket.on('bot reply', function(replyText) {
  // synthVoice(replyText);

  if(replyText == '') replyText = '(No answer...)';
  outputBot.textContent = replyText;
});
