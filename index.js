'use strict';

require('dotenv').config()
const openAIImport = require('openai');
const configuration = new openAIImport.Configuration({
  apiKey: process.env.CHAT_GPT_API_KEY,
});
const openai = new openAIImport.OpenAIApi(configuration);



const textToSpeech = require('@google-cloud/text-to-speech');
const {Translate} = require('@google-cloud/translate').v2;


// Import other required libraries
const fs = require('fs');
const path = require('path');
const util = require('util');
const CONVERSATIONS_JSON = path.join(__dirname, 'conversations.json');

const client = new textToSpeech.TextToSpeechClient();
const translate = new Translate();

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

const io = require('socket.io')(server);
io.on('connection', function(socket){
  console.log('a user connected');
  fs.readFile(CONVERSATIONS_JSON, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    let conversations = [];
    if(data.toString()) {
      console.log('coming inside', data.toString());
      conversations = JSON.parse(data.toString());
    }
    socket.emit('startConversations', conversations);
  });
});

// const apiai = require('apiai')(APIAI_TOKEN);

// Web UI
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

io.on('connection', function(socket) {
  socket.on('chat message', async (text) => {
    console.log('Message: ' + text);

    // convert text to english

    // Get a reply from API.ai

    // let apiaiReq = apiai.textRequest(text, {
    //   sessionId: APIAI_SESSION_ID
    // });

    const [englishTranslation] = await translate.translate(text, 'en-US');
    console.log('englishTranslation', englishTranslation);

    try {
      const completion = await openai.createCompletion({
        model: process.env.OPEN_AI_MODAL,
        prompt: englishTranslation,
        temperature: +process.env.OPEN_AI_TEMPERATURE,
        max_tokens: +process.env.CHAT_GPT_MAX_TOKENS,
      });
      const aiText = completion.data.choices[0].text?.trim();

      console.log(aiText, 'aiText');

      const [kannadaTranslation] = await translate.translate(aiText, 'kn');
      const request = {
        input: {text: kannadaTranslation},
        // Select the language and SSML voice gender (optional)
        voice: {languageCode: 'kn-IN', ssmlGender: 'NEUTRAL'},
        // select the type of audio encoding
        audioConfig: {audioEncoding: 'MP3'},
      };
  
      // Performs the text-to-speech request
      const [response] = await client.synthesizeSpeech(request);
      const buff = Buffer.from(response.audioContent, 'base64');
      fs.writeFileSync('views/output.mp3', buff);
      fs.readFile(CONVERSATIONS_JSON, function(err, data) {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        let conversations = [];
        if(data.toString()) {
          console.log('coming inside', data.toString());
          conversations = JSON.parse(data.toString());
        }
        if(conversations.length) {
          // push user input
          conversations.push(
              {"chat": text, "buffer": "", "isBot": false}
          );
          conversations.push({
            "chat": kannadaTranslation,
            "buffer": response.audioContent,
            "isBot": true
          })
        } else {
          conversations = [
            {"chat": text, "buffer": "", "isBot": false},
            {
              "chat": kannadaTranslation,
              "buffer": response.audioContent,
              "isBot": true
            }
          ]
        }
        fs.writeFile(CONVERSATIONS_JSON, JSON.stringify(conversations), function(err) {
          if (err) {
            console.error(err);
            process.exit(1);
          }
          // Emits updated bid to all sockets upon successful save
          socket.emit('conversations', conversations);
        });
      });
      socket.emit('audio reply', response.audioContent)
      socket.emit('bot reply', kannadaTranslation);
    } catch (error) {
      console.log(error);
    }
    

    

    // apiaiReq.on('response', (response) => {
    //   let aiText = response.result.fulfillment.speech;
    //   console.log('Bot reply: ' + aiText);
    //   socket.emit('bot reply', aiText);
    // });

    // apiaiReq.on('error', (error) => {
    //   console.log(error);
    // });

    // apiaiReq.end();

  });
});
