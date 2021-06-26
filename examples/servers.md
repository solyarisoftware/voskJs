# `voskjshttp` and other server examples

- [`voskjshttp.js` demo speech-to-text HTTP server](#voskjshttpjs-demo-speech-to-text-http-server)
- [`voskjshttp` as RHASSPY speech-to-text remote HTTP Server](#voskjshttp-as-rhasspy-speech-to-text-remote-http-server)
- [SocketIO server pseudocode](#socketio-server-pseudocode)


## `voskjshttp.js` demo speech-to-text HTTP server 

[`voskjshttp.js`](voskjshttp.js) is a very simple HTTP API server 
able to process concurrent/multi-user transcript requests, using a specific language model.

A dedicated thread is spawned for each transcript processing request, 
so latency performance will be optimal if your host has multiple cores.

Currently the server support just a single endpoint: 

- HTTP GET /transcript
- HTTP POST /transcript

Server settings:

```bash
cd examples && node voskjshttp.js 
```
or, if you installed this package as global:
```bash
voskjshttp
```
```
Simple demo HTTP JSON server, loading a Vosk engine model to transcript speeches.
package @solyarisoftware/voskjs version 1.1.3, Vosk-api version 0.3.30

The server has two endpoints:

  HTTP GET /transcript
  The request query string arguments contain parameters,
  including a WAV file name already accessible by the server.

  HTTP POST /transcript
  The request query string arguments contain parameters,
  the request body contains the WAV file name to be submitted to the server.

Usage:

  voskjshttp --model=<model directory path> \ 
                [--port=<server port number. Default: 3000>] \ 
                [--path=<server endpoint path. Default: /transcript>] \ 
                [--no-threads]
                [--debug[=<vosk log level>]]

Server settings examples:

  voskjshttp --model=../models/vosk-model-en-us-aspire-0.2 --port=8086 --debug=2
  # stdout includes the server internal debug logs and Vosk debug logs (log level 2)

  voskjshttp --model=../models/vosk-model-en-us-aspire-0.2 --port=8086 --debug
  # stdout includes the server internal debug logs without Vosk debug logs (log level -1)

  voskjshttp --model=../models/vosk-model-en-us-aspire-0.2 --port=8086
  # stdout includes minimal info, just request and response messages

  voskjshttp --model=../models/vosk-model-small-en-us-0.15
  # stdout includes minimal info, default port number is 3000

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

  5. POST /transcript - body includes the speech file

  curl -s \ 
       -X POST \ 
       -H "Accept: application/json" \ 
       -H "Content-Type: audio/wav" \ 
       --data-binary="@../audio/2830-3980-0043.wav" \ 
       "http://localhost:3000/transcript?id=1620060067830&model=vosk-model-en-us-aspire-0.2"
```

Server run example:

```bash
voskjshttp --model=../models/vosk-model-small-en-us-0.15
```

Client call example:

```bash
curl \
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
    "latency": 575,
    "vosk": {
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
   node voskjshttp --model=../models/vosk-model-small-en-us-0.15
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


## `voskjshttp` as RHASSPY speech-to-text remote HTTP Server

[RHASSPY](https://rhasspy.readthedocs.io/en/latest/) is an open source, 
fully offline set of voice assistant services.

RHASSPY uses, as option, a [Remote HTTP Server ](https://rhasspy.readthedocs.io/en/latest/speech-to-text/#remote-http-server)
to transform speech (WAV) to text. This is typically used in a client/server set up, 
where Rhasspy does speech/intent recognition on a home server with decent CPU/RAM available.

You can run voskjshttp as RHASSPY speech-to-text remote HTTP Server
Following these specifications:

- https://rhasspy.readthedocs.io/en/latest/speech-to-text/#remote-http-server
- https://rhasspy.readthedocs.io/en/latest/usage/#http-api
- https://rhasspy.readthedocs.io/en/latest/reference/#http-api


1. Install the server

   Install on your home server, as described [here](../README.md#-install): 
   - Vosk
   - `npm install -g @solyarisoftware/voskjs`
   - A Vosk language model of your choice

2. Run the server 

   Warning:
   currently, because a bug in the Node-C++ interface of Vosk-API lib, multithreading causes a crash: https://github.com/solyarisoftware/voskJs/issues/3 
   Two temporary alternative workarounds proposed:

   - Vosk Multithreading **enabled**

     Use a Node version previous to v. 14. 
     See: https://github.com/alphacep/vosk-api/issues/516#issuecomment-833462121
     ```
     voskjshttp \
       --model=models/vosk-model-small-en-us-0.15 \
       --path=/api/speech-to-text \
       --port=12101
     ```

   - Vosk Multithreading **disabled**
 
     Use any Node version successive v.13 but disable multithreading in `voskjshttp`, 
     with a command line flag `--no-threads`. 

     This option seems to be a nonsense, because in this way the server just serve one request a time 
     (that will saturate a CPU core for hundreds of milliseconds, also blocking the Node main thread). 
     Nevertheless the lack of multithreading could be acceptable to serve few satellites (clients) in a small (home) environment.
     ```
     voskjshttp \
       --model=models/vosk-model-small-en-us-0.15 \
       --path=/api/speech-to-text \
       --port=12101 \
       --no-threads
     ```

3. Curl client tests

   Two bash scripts are available in the tests/ directory:

   - [`clientRHASSPYtext.sh`](../tests/clientRHASSPYtext.sh) get a text/plain response from the server
     ```
     clientRHASSPYtext.sh
     ```
     ```
     experience proves this
     ```

   - [`clientRHASSPYjson.sh`](../tests/clientRHASSPYjson.sh) get an application/json response from the server

     ```
     clientRHASSPYjson.sh
     ```
     ```
     { 
        "id": 1622012841793,
        "latency": 570,
        "vosk": {
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
     }
     ```


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

[top](#) | [back](README.md) | [home](../README.md)


