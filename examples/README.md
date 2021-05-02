# Transcript usage examples

## VoskJs Command line usage

```bash
$ node voskjs

usage:

    node voskjs --model=<model directory> --audio=<audio file name>

example:

    node voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2
```

## Standalone transcript program (one request at time)

[`simplest.js`](simplest.js) is a basic demo using VoskJs functionalities. 

The program transcript a wav file, using a specific language model. 
This is the brainless Vosk interface, perfect for embedded / standalone systems.

```bash
$ node simplest
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

> NOTE
> The async architecture allows to process almost single requests (from single users).
> A dedicated thread is spawned for each transcript processing. 
> That means that the nodejs main thread is not 'saturated' by the CPU-intensive transcript processing.
> Latency performance will be optimal if your host has at least 2 cores.


## Transcript HTTP server 

[`httpServer.js`](httpServer.js) is a very simple HTTP API server 
able to process concurrent/multi-user transcript requests, using a specific language model.

Currently the server support just a single endpoint `HTTP POST /transcript`

> A dedicated thread is spawned for each transcript processing request, 
> so latency performance will be optimal if your host has multiple cores.


Server settings:

```
$ node httpServer 

Usage

    node httpServer --model=<model directory path> \ 
                  [--port=<port number> \
                  [--debug[=<vosk log level>]]

Server settings examples

    node httpServer --model=../models/vosk-model-en-us-aspire-0.2 --port=8086 --debug=2
    # -> stdout inludes httpServer internal debug logs and Vosk debug logs (log level 2)

    node httpServer --model=../models/vosk-model-en-us-aspire-0.2 --port=8086 --debug
    # -> stdout includes httpServer internal debug logs without Vosk debug logs (log level -1)

    node httpServer --model=../models/vosk-model-en-us-aspire-0.2 --port=8086
    # -> stdout includes minimal info, just request and response messages

    node httpServer --model=../models/vosk-model-small-en-us-0.15
    # -> stdout includes minimal info, default port number is 3000

Client requests examples

    curl -s \ 
         -X POST \ 
         -H "Content-Type: application/json" \ 
         -d '{"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}' \ 
         http://localhost:3000/transcript
```

Server run example:

```bash
node httpServer.js --model=../models/vosk-model-en-us-aspire-0.2 --port==3000 --debug
```

The server API endpoint client call has the format:

```bash
curl \
--header "Content-Type: application/json" \
--request POST \
--data '{ "speech": "../audio/2830-3980-0043.wav", "model": "vosk-model-en-us-aspire-0.2"} \
http://localhost:3000/transcript
```

The JSON returned by the transcript endpoint: 

```bash
$ com/curlClientJSON.sh
{
    "speech": "../audio/2830-3980-0043.wav",
    "model": "vosk-model-en-us-aspire-0.2",
    "requestId": 1619796459716,
    "latency": 459,
    "result": [
        {
            "conf": 0.980969,
            "end": 1.02,
            "start": 0.33,
            "word": "experience"
        },
        {
            "conf": 1,
            "end": 1.349919,
            "start": 1.02,
            "word": "proves"
        },
        {
            "conf": 0.997301,
            "end": 1.71,
            "start": 1.35,
            "word": "this"
        }
    ],
    "text": "experience proves this"
}
```

So the HTTP POST endpoint `/transcript` return a JSON data structure containing:

- `speech` the name of the speech file in the request
- `model` the name of the model (the language) in the request
- `requestId` an "UUID" that's the unix epoch timestamp 
  that identify the incoming request and it could be used for debug.
- `latency` the elapsed time, in milliseconds, required to elaborate the request
- `result` the data structure returned by Vosk transcript function.

The HTTP server corresponding log is:

```bash
node httpServer.js --model=../models/vosk-model-en-us-aspire-0.2/
```
```
1619796452845 Model path: ../models/vosk-model-en-us-aspire-0.2/
1619796452855 Model name: vosk-model-en-us-aspire-0.2
1619796455934 load model latency: 3078ms
1619796455935 Press Ctrl-C to shutdown
1619796455937 Server httpServer.js running at http://localhost:3000
1619796455937 Endpoint http://localhost:3000/transcript
1619796459716 request  {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}
1619796460175 latency  1619796459716 459ms
1619796460175 response 1619796459716 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619796459716,"latency":459,"result":[{"conf":0.980969,"end":1.02,"start":0.33,"word":"experience"},{"conf":1,"end":1.349919,"start":1.02,"word":"proves"},{"conf":0.997301,"end":1.71,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619796987904 request  {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}
1619796988349 latency  1619796987904 445ms
1619796988349 response 1619796987904 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619796987904,"latency":445,"result":[{"conf":0.97987,"end":1.02,"start":0.33,"word":"experience"},{"conf":1,"end":1.349885,"start":1.02,"word":"proves"},{"conf":0.996167,"end":1.71,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619796989071 request  {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}
1619796989524 latency  1619796989071 452ms
1619796989525 response 1619796989071 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619796989071,"latency":452,"result":[{"conf":0.980733,"end":1.02,"start":0.33,"word":"experience"},{"conf":1,"end":1.349923,"start":1.02,"word":"proves"},{"conf":0.997445,"end":1.71,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619796990025 request  {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}
1619796990465 latency  1619796990025 440ms
1619796990466 response 1619796990025 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619796990025,"latency":440,"result":[{"conf":0.979754,"end":1.02,"start":0.33,"word":"experience"},{"conf":1,"end":1.34989,"start":1.02,"word":"proves"},{"conf":0.996323,"end":1.71,"start":1.35,"word":"this"}],"text":"experience proves this"}
```

For each incoming request, the server logs the request body and the JSON response:

- `request` body JSON
- `response` <requestId> response JSON request <requestId>

In the server log you can trace the incoming request (by example with requestId `1619796459716`) in these lines:
```
1619796459716 request  {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}
1619796460175 response 1619796459716 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619796459716,"latency":459,"result":[{"conf":0.980969,"end":1.02,"start":0.33,"word":"experience"},{"conf":1,"end":1.349919,"start":1.02,"word":"proves"},{"conf":0.997301,"end":1.71,"start":1.35,"word":"this"}],"text":"experience proves this"}
```

> [`tests/`](../tests/) directory contains some utility bash scripts to test the client/server communication.

---

[top](#) | [home](../README.md)

