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

> The async architecture allows to process almost single requests (from single users).
> A dedicated thread is spawned for each transcript processing. 
> That means that the nodejs main thread is not 'saturated' by the CPU-intensive transcript processing.
> Latency performance will be optimal if your host has at least 2 cores.


## Transcript HTTP server 

[`httpServer.js`](httpServer.js) is a simple HTTP API server 
able to process concurrent/multi-user transcript requests in a specific language.

> A dedicated thread is spawned for each transcript processing request. 
> Latency performance will be optimal if your host has multiple cores.


To run the server: 

```bash
node httpServer
```


The server API endpoint client must call is very simple:

```bash
curl \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{ "speech": "../audio/2830-3980-0043.wav", "model": "vosk-model-en-us-aspire-0.2"} \
  http://localhost:3000/transcript
```

`com/` directory contains some utility bash scripts to test the client/server communication.
By example, if you want to test the JSON returned by the transcript endpoint: 

```bash
$ com/curlClientJSON.sh
{
    "speech": "../audio/2830-3980-0043.wav",
    "model": "vosk-model-en-us-aspire-0.2",
    "latency": 583,
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

The HTTP server corresponding log:

```bash
$ node httpServer.js

1619687592873 Press Ctrl-C to shutdown
1619687592875 Model directory: ../models/vosk-model-small-en-us-0.15
LOG (VoskAPI:ReadDataFiles():model.cc:194) Decoding params beam=10 max-active=3000 lattice-beam=2
LOG (VoskAPI:ReadDataFiles():model.cc:197) Silence phones 1:2:3:4:5:6:7:8:9:10
LOG (VoskAPI:RemoveOrphanNodes():nnet-nnet.cc:948) Removed 0 orphan nodes.
LOG (VoskAPI:RemoveOrphanComponents():nnet-nnet.cc:847) Removing 0 orphan components.
LOG (VoskAPI:CompileLooped():nnet-compile-looped.cc:345) Spent 0.0411849 seconds in looped compilation.
LOG (VoskAPI:ReadDataFiles():model.cc:221) Loading i-vector extractor from ../models/vosk-model-small-en-us-0.15/ivector/final.ie
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:183) Computing derived variables for iVector extractor
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:204) Done.
LOG (VoskAPI:ReadDataFiles():model.cc:251) Loading HCL and G from ../models/vosk-model-small-en-us-0.15/graph/HCLr.fst ../models/vosk-model-small-en-us-0.15/graph/Gr.fst
LOG (VoskAPI:ReadDataFiles():model.cc:273) Loading winfo ../models/vosk-model-small-en-us-0.15/graph/phones/word_boundary.int
1619687594074 init model latency: 1198ms
1619687594095 Server httpServer.js running at http://localhost:3000
1619687594095 Endpoint POST http://localhost:3000/transcript
1619687628186 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}
1619687628770 transcript latency: 583ms
1619687628770 response {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","latency":583,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
```

---

[top](#) | [home](../README.md)

