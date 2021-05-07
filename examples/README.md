# Transcript usage examples

- [VoskJs command line usage](#voskjs-command-line-usage)
- [Simple transcript program](#simple-transcript-program) 
- [Transcript with grammar](#transcript-with-grammar) 
- [Transcript HTTP server](#transcript-http-server)
- [SocketIO server pseudocode](#socketio-server-pseudocode)


## VoskJs Command line usage

If you install install this module as global package: 
```bash
npm install -g @solyarisoftware/voskjs
```

Afterward you can enjoy voskjs command line utility program:

```bash
$ voskjs
```
```
usage:

    voskjs --model=<model directory> --audio=<audio file name>

example:

    voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2
```

## Simple transcript program 

[`simple.js`](simple.js) is a basic demo using VoskJs functionalities. 

The program transcript (recognize, in Vosk parlance) a speech in a wav file, 
using a specified language model. 
This is the brainless Vosk interface, perfect for embedded / standalone systems, 
but also as entry point for any custom server applications.

> NOTE
> With trascript function default settings, 
> a dedicated thread is spawned for each transcript processing. 
> That means that the nodejs main thread is not 'saturated' by the CPU-intensive transcript processing.
> Latency performance will be optimal if your host has at least 2 cores.


```bash
$ node simplest
```
```
model directory      : ../models/vosk-model-en-us-aspire-0.2
speech file name     : ../audio/2830-3980-0043.wav
load model latency   : 28439ms
{
  result: [
    { conf: 0.980969, end: 1.02, start: 0.33, word: 'experience' },
    { conf: 1, end: 1.349919, start: 1.02, word: 'proves' },
    { conf: 0.997301, end: 1.71, start: 1.35, word: 'this' }
  ],
  text: 'experience proves this'
}
transcript latency : 471ms
```


## Transcript with grammar

[`grammar.js`](grammar.js) is a basic demo using Vosk recognizer using grammars. 

```bash
$ node grammar
```
```
model directory      : ../models/vosk-model-small-en-us-0.15
speech file name     : ../audio/2830-3980-0043.wav
grammar              : experience,proves,this,experience proves that
load model latency   : 1497ms
{
  result: [
    { conf: 1, end: 1.02, start: 0.36, word: 'experience' },
    { conf: 1, end: 1.35, start: 1.02, word: 'proves' },
    { conf: 1, end: 1.74, start: 1.35, word: 'this' }
  ],
  text: 'experience proves this'
}
transcript latency : 76ms
```

Note: 
latency is very low if grammar sentences are provided!

See details here: 
- https://github.com/alphacep/vosk-api/blob/master/nodejs/index.js#L198
- https://github.com/alphacep/vosk-api/blob/91a128b3edf7e84d55649d8fa9a60664b5386292/src/vosk_api.h#L114
- https://github.com/alphacep/vosk-api/issues/500


## Transcript HTTP server 

[`httpServer.js`](httpServer.js) is a very simple HTTP API server 
able to process concurrent/multi-user transcript requests, using a specific language model.

Currently the server support just a single endpoint `HTTP POST /transcript`

Note: 
A dedicated thread is spawned for each transcript processing request, 
so latency performance will be optimal if your host has multiple cores.


Server settings:

```bash
$ node httpServer.js 
```
```
httpServer is a simple HTTP JSON server, loading a Vosk engine model
to transcript speech files specified in HTTP POST /transcript request body client calls

Usage:

    httpServer --model=<model directory path> \ 
                  [--port=<port number> \
                  [--debug[=<vosk log level>]]

Server settings examples:

    stdout inludes httpServer internal debug logs and Vosk debug logs (log level 2)
    node httpServer --model=../models/vosk-model-en-us-aspire-0.2 --port=8086 --debug=2

    stdout includes httpServer internal debug logs without Vosk debug logs (log level -1)
    node httpServer --model=../models/vosk-model-en-us-aspire-0.2 --port=8086 --debug

    stdout includes minimal info, just request and response messages
    node httpServer --model=../models/vosk-model-en-us-aspire-0.2 --port=8086

    stdout includes minimal info, default port number is 3000
    node httpServer --model=../models/vosk-model-small-en-us-0.15

Client requests examples:

    request body includes attributes: id, speech, model, grammar
    curl -s \ 
         -X POST \ 
         -H "Content-Type: application/json" \ 
         -d '{"id":"1620060067830","speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","grammar":["experience proves this"]}' \ 
         http://localhost:3000/transcript

    request body includes attributes: id, speech, model
    curl -s \ 
         -X POST \ 
         -H "Content-Type: application/json" \ 
         -d '{"id":"1620060067830","speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}' \ 
         http://localhost:3000/transcript

    request body includes attributes: speech, model
    curl -s \ 
         -X POST \ 
         -H "Content-Type: application/json" \ 
         -d '{"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}' \ 
         http://localhost:3000/transcript


    request body includes just the speech attribute
    curl -s \ 
         -X POST \ 
         -H "Content-Type: application/json" \ 
         -d '{"speech":"../audio/2830-3980-0043.wav"}' \ 
         http://localhost:3000/transcript
```

Server run example:

```bash
node httpServer.js --model=../models/vosk-model-en-us-aspire-0.2 --port==3000 --debug
```

The server API endpoint client call has the complete format in the following example:

```bash
curl \
--header "Content-Type: application/json" \
--request POST \
--data '{"id":1620312465142,"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-small-en-us-0.15","grammar":["experience proves this","why should one hold on the way","your power is sufficient i said"]}' \
http://localhost:3000/transcript
```

The JSON returned by the transcript endpoint: 

```bash
$ curlClientIdSpeechModelGrammar.sh
```
```
{
    "request": {
        "id": 1620311991357,
        "speech": "../audio/2830-3980-0043.wav",
        "model": "vosk-model-small-en-us-0.15",
        "grammar": [
            "experience proves this",
            "why should one hold on the way",
            "your power is sufficient i said"
        ]
    },
    "id": 1620311991357,
    "latency": 620,
    "result": [
        {
            "conf": 1,
            "end": 1.02,
            "start": 0.36,
            "word": "experience"
        },
        {
            "conf": 1,
            "end": 1.35,
            "start": 1.02,
            "word": "proves"
        },
        {
            "conf": 1,
            "end": 1.74,
            "start": 1.35,
            "word": "this"
        }
    ],
    "text": "experience proves this"
}
```

The server output:
```
1620312429756 Model path: ../models/vosk-model-small-en-us-0.15
1620312429758 Model name: vosk-model-small-en-us-0.15
1620312429758 HTTP server port: 3000
1620312429758 internal debug log: false
1620312429758 Vosk log level: -1
1620312429758 wait loading Vosk model: vosk-model-small-en-us-0.15 (be patient)
1620312430058 Vosk model loaded in 300 msecs
1620312430060 server httpServer.js running at http://localhost:3000
1620312430060 endpoint http://localhost:3000/transcript
1620312430060 press Ctrl-C to shutdown
1620312430060 ready to listen incoming requests
1620312435318 request {"id":1620312435283,"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-small-en-us-0.15","grammar":["experience proves this","why should one hold on the way","your power is sufficient i said"]}
1620312435941 response 1620312435283 {"request":{"id":1620312435283,"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-small-en-us-0.15","grammar":["experience proves this","why should one hold on the way","your power is sufficient i said"]},"id":1620312435283,"latency":623,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1620312465331 request {"id":1620312465142,"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-small-en-us-0.15","grammar":["experience proves this","why should one hold on the way","your power is sufficient i said"]}
1620312465956 response 1620312465142 {"request":{"id":1620312465142,"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-small-en-us-0.15","grammar":["experience proves this","why should one hold on the way","your power is sufficient i said"]},"id":1620312465142,"latency":625,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
```

### client body request options

The body request must contains the attribute `speech` 
to specify the speech WAV file for the server speech-to-text conversion.

The `model` attribute is optional. 
If specified, the server verifies if it matches with the model name of the server-side loaded model.

If `model` is not specified, the server do not make any control, just using the load model.
In this case the client call is just:

```bash
curl --header "Content-Type: application/json" \
--request POST --data '{ "speech": "../audio/2830-3980-0043.wav"} \
http://localhost:3000/transcript
```

The HTTP server corresponding log is:

```bash
$ node httpServer --model=../models/vosk-model-small-en-us-0.15
```
```
1620312429756 Model path: ../models/vosk-model-small-en-us-0.15
1620312429758 Model name: vosk-model-small-en-us-0.15
1620312429758 HTTP server port: 3000
1620312429758 internal debug log: false
1620312429758 Vosk log level: -1
1620312429758 wait loading Vosk model: vosk-model-small-en-us-0.15 (be patient)
1620312430058 Vosk model loaded in 300 msecs
1620312430060 server httpServer.js running at http://localhost:3000
1620312430060 endpoint http://localhost:3000/transcript
1620312430060 press Ctrl-C to shutdown
1620312430060 ready to listen incoming requests
1620312435318 request {"id":1620312435283,"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-small-en-us-0.15","grammar":["experience proves this","why should one hold on the way","your power is sufficient i said"]}
1620312435941 response 1620312435283 {"request":{"id":1620312435283,"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-small-en-us-0.15","grammar":["experience proves this","why should one hold on the way","your power is sufficient i said"]},"id":1620312435283,"latency":623,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
```

For each incoming request, the server logs the request body and the JSON response:

- `request` body JSON
- `response` <requestId> response JSON request <requestId>

The HTTP POST endpoint `/transcript` returns a JSON data structure containing:

- `speech` the name of the speech file in the request
- `model` the name of the model (the language) in the request
- `id` an "UUID" that's the unix epoch timestamp 
  that identify the incoming request and it could be used for debug.
- `latency` the elapsed time, in milliseconds, required to elaborate the request
- `result` the data structure returned by Vosk transcript function.

### HTTP Server Tests

[`tests/`](../tests/) directory contains some utility bash scripts to test the client/server communication.



## SockeIO server pseudocode

HTTP server is not the only way to go! 
Consider by example a client-server architecture using [socketio](https://socket.io/) 
websocket-based real-time bidirectional event-based communication library. 

Here below a simplified server-side pseudo-code taht shows how to use voskJs transcript:

```javascript
const app = require('express')()

// get SSL certificate
const credentials = {
  key: fs.readFileSync(KEY_FILENAME, 'utf8'), 
  cert: fs.readFileSync(CERT_FILENAME, 'utf8')
}

// create the https server
const server = https.createServer(credentials, app)

// create the socketio channel 
const io = require('socket.io')(server)

// a websocket message arrived
io.on('connection', (socket) => {

  // the client sent an audio buffer
  socket.on('audioMessage', msg => {

  // save audio buffer into a local file, giving a unique name
  const audioFileCompressed = filenameUUID()
  await msgToAudioFile(audioFileCompressed, msg)

  // convert the received audio into a WAV format file
  const audioFileWav = convertToWav(audioFileCompressed)
  
  // voskjs speech to text 
  console.log( await transcript(audioFileWav, model) )

  })
})
```


---

[top](#) | [home](../README.md)

