# Transcript usage examples

- [`voskjs` Command line utility](#voskjs-command-line-utility)
- [Simple transcript program](#simple-transcript-program) 
- [Transcript with grammar](#transcript-with-grammar) 
- [Transcript HTTP server](#transcript-http-server)
- [SocketIO server pseudocode](#socketio-server-pseudocode)


## `voskjs` Command line utility

If you install install this module as global package: 
```bash
npm install -g @solyarisoftware/voskjs
```

Afterward you can enjoy voskjs command line utility program:

```bash
$ voskjs
```
```
  Usage:

    voskjs --model=<model directory> \
            --audio=<audio file name> \
            --grammar=<list of comma-separated words or sentences> \

  Examples :

    1. Transcript a speech file using a specific model directory

       voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2

    2. Transcript a speech file using a grammar (allowed by a specific model)

       voskjs --audio=audio/2830-3980-0043.wav \
              --model=models/vosk-model-small-en-us-0.15 \
              --grammar="experience proves this, bla bla bla"
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

[`voskjshttp.js`](voskjshttp.js) is a very simple HTTP API server 
able to process concurrent/multi-user transcript requests, using a specific language model.

A dedicated thread is spawned for each transcript processing request, 
so latency performance will be optimal if your host has multiple cores.

Currently the server support just a single endpoint: 

- HTTP GET /transcript
- HTTP POST /transcript

Server settings:

```bash
$ cd examples && node httpServer.js 
```
or, if you installed this package as global:
```bash
$ voskjshttp
```
```
Simple HTTP JSON server, loading a Vosk engine model to transcript speeches.
The server has two endpoints:

- HTTP GET /transcript
  The request query string arguments contain parameters,
  including a WAV file name already accessible by the server.

- HTTP POST /transcript
  The request query string arguments contain parameters,
  the request body contains the WAV file name to be submitted to the server.

Usage:

    voskjshttp --model=<model directory path> \
                  [--port=<port number> \
                  [--debug[=<vosk log level>]]

Server settings examples:

    stdout includes the server internal debug logs and Vosk debug logs (log level 2)
    node voskjshttp --model=../models/vosk-model-en-us-aspire-0.2 --port=8086 --debug=2

    stdout includes the server internal debug logs without Vosk debug logs (log level -1)
    node voskjshttp --model=../models/vosk-model-en-us-aspire-0.2 --port=8086 --debug

    stdout includes minimal info, just request and response messages
    node voskjshttp --model=../models/vosk-model-en-us-aspire-0.2 --port=8086

    stdout includes minimal info, default port number is 3000
    node voskjshttp --model=../models/vosk-model-small-en-us-0.15

Client requests examples:

    1. GET /transcript - query string includes just the speech file argument

    curl -s \
         -X GET \
         -H "Accept: application/json" \
         -G \
         --data-urlencode speech="../audio/2830-3980-0043.wav" \
         http://localhost:3000/transcript

    2. GET /transcript - query string includes arguments: speech, model

    curl -s \
         -X GET \
         -H "Accept: application/json" \
         -G \
         --data-urlencode speech="../audio/2830-3980-0043.wav" \
         --data-urlencode model="vosk-model-en-us-aspire-0.2" \
         http://localhost:3000/transcript

    3. GET /transcript - query string includes arguments: id, speech, model

    curl -s \
         -X GET \
         -H "Accept: application/json" \
         -G \
         --data-urlencode id="1620060067830" \
         --data-urlencode speech="../audio/2830-3980-0043.wav" \
         --data-urlencode model="vosk-model-en-us-aspire-0.2" \
         http://localhost:3000/transcript

    4. GET /transcript - includes arguments: id, speech, model, grammar

    curl -s \
         -X GET \
         -H "Accept: application/json" \
         -G \
         --data-urlencode id="1620060067830" \
         --data-urlencode speech="../audio/2830-3980-0043.wav" \
         --data-urlencode model="vosk-model-en-us-aspire-0.2" \
         --data-urlencode grammar="["experience proves this"]" \
         http://localhost:3000/transcript

    5. POST /transcript - the speech file is sent as body payload

    curl -s \
         -X POST \
         -H "Accept: application/json" \
         --data-binary="@../audio/2830-3980-0043.wav" \
         "http://localhost:3000/transcript?id='1620060067830'&model='vosk-model-en-us-aspire-0.2'"
```

Server run example:

```bash
voskjshttp --model=../models/vosk-model-small-en-us-0.15
```

Client call example:

```bash
$ curl \
  -s \
  -H "Accept: application/json" \
  -G \
  --data-urlencode id="283039800043" \
  --data-urlencode speech="../audio/2830-3980-0043.wav" \
  --data-urlencode model="vosk-model-small-en-us-0.15" \
  http://localhost:3000/transcript \
  | python3 -m json.tool
```

The JSON returned by the transcript endpoint: 
```
{
    "id": "283039800043",
    "latency": 574,
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

Server side stdout:

```
1621335095393 Model path: ../models/vosk-model-small-en-us-0.15
1621335095395 Model name: vosk-model-small-en-us-0.15
1621335095395 HTTP server port: 3000
1621335095395 internal debug log: false
1621335095395 Vosk log level: -1
1621335095395 wait loading Vosk model: vosk-model-small-en-us-0.15 (be patient)
1621335095710 Vosk model loaded in 314 msecs
1621335095712 server voskjshttp.js running at http://localhost:3000
1621335095712 endpoint http://localhost:3000/transcript
1621335095712 press Ctrl-C to shutdown
1621335095713 ready to listen incoming requests
1621335101648 request 283039800043 ../audio/2830-3980-0043.wav vosk-model-small-en-us-0.15 undefined
1621335102223 response 283039800043 {"id":"283039800043","latency":574,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
^[^C1621335336951 SIGINT received
1621335337010 Shutdown done
```

### client request query string arguments

- `speech` 

  The request quesry string argument is mandatory.
  It specifies the speech WAV file for the server speech-to-text transcription

- `model` 

  The argument is optional. 
  If specified, the server verifies if it matches with the model name of the server-side loaded model
  If the argument is not specified, the server doesn't make any control, just using the loaded model
  In this case the client call is just:

  ```bash
  curl \
    -H "Accept: application/json" \
    -G \
    --data-urlencode speech="../audio/2830-3980-0043.wav" \
    http://localhost:3000/transcript
  ```

   The HTTP server corresponding log is:

   ```bash
   $ node voskjshttp --model=../models/vosk-model-small-en-us-0.15
   ```
   ```
   1620312429756 Model path: ../models/vosk-model-small-en-us-0.15
   1620312429758 Model name: vosk-model-small-en-us-0.15
   1620312429758 HTTP server port: 3000
   1620312429758 internal debug log: false
   1620312429758 Vosk log level: -1
   1620312429758 wait loading Vosk model: vosk-model-small-en-us-0.15 (be patient)
   1620312430058 Vosk model loaded in 300 msecs
   1620312430060 server voskjshttp.js running at http://localhost:3000
   1620312430060 endpoint http://localhost:3000/transcript
   1620312430060 press Ctrl-C to shutdown
   1620312430060 ready to listen incoming requests
   1620312435318 request {"id":1620312435283,"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-small-en-us-0.15","grammar":["experience proves this","why should one hold on the way","your power is sufficient i said"]}
   1620312435941 response 1620312435283 {"request":{"id":1620312435283,"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-small-en-us-0.15","grammar":["experience proves this","why should one hold on the way","your power is sufficient i said"]},"id":1620312435283,"latency":623,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
   ```

### Server JSON response 

The HTTP response returns a JSON data structure containing:

- `speech` the name of the speech file in the request
- `model` the name of the model (the language) in the request
- `id` an "UUID" that's the unix epoch timestamp 
  that identify the incoming request and it could be used for debug.
- `latency` the elapsed time, in milliseconds, required to elaborate the request
- `result` the data structure returned by Vosk transcript function.

### HTTP Server Tests

[`tests/`](../tests/) directory contains some utility bash scripts (client*.sh) to test the server endpoint with GEt and POST methods.


## SocketIO server pseudocode

HTTP server is not the only way to go! 
Consider by example a client-server architecture using [socketio](https://socket.io/) 
websocket-based real-time bidirectional event-based communication library. 

Here below a simplified server-side pseudo-code taht shows how to use voskJs transcript:

```javascript
const {transcript, toPCM } = require('voskjs')
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

    // convert the received audio into a PCM buffer 
    const buffer = toPCM(audioFileCompressed)

    // voskjs speech to text 
    const voskResult = await transcriptFromBuffer(buffer, model)

  })
})
```


---

[top](#) | [home](../README.md)

