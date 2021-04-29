# VoskJs

Vosk ASR engine runtime transcript NodeJs client.

VoskJs can be used for speech recognition processing in different scenarios:
- Single-user/standalone programs (e.g. perfect for single-user embedded systems) 
- Multi-user/multi-core server architectures 


## What's Vosk?

Vosk is an open-source speech recognition engine/toolkit, by Nikolay V. Shmyrev. 
Documentation:

- https://alphacephei.com/vosk/
- https://github.com/alphacep/vosk-api

## What's VoskJs?

The goal of the simple project is to:

1. Create an simple function API layer on top of already existing Vosk nodejs binding, 
   supplying just three functions: 

   - `loadModel(modelDirectory, logLevel=0)`
   - `transcript(fileName, model, multiThreads=true)` 
   - `freeModel(model)`

   Using the simple transcript interface you can build your standalone nodejs application, 
   accessing async functions suitable to run on a usual single thread nodejs program.

2. Use `voskjs` command line program to test Vosk transcript with specific models 
  (some tests and command line usage [here](tests/README.md)).

3. Setup a simple HTTP server to transcript speech files. 
   Usage examples [here](examples/). 


## Install 

### 1. Install Vosk engine and relative nodejs module

```bash
pip3 install vosk 
npm install vosk
```

See https://alphacephei.com/vosk/install


### 2. Install/Download Vosk models

```bash
mkdir models && cd models

# English large model
wget https://alphacephei.com/vosk/models/vosk-model-en-us-aspire-0.2.zip
unzip vosk-model-en-us-aspire-0.2.zip

# English small model
wget http://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip

# Italian model model
wget https://alphacephei.com/vosk/models/vosk-model-small-it-0.4.zip
unzip vosk-model-small-it-0.4.zip

cd ..
```

See https://alphacephei.com/vosk/models

### 3. Demo audio files

This repository contains in `audio/` directory, 
few English language speech audio files, coming from Mozilla DeepSpeech.
That's useful to make some tests and comparisons. 

Source: [Mozilla DeepSpeech audio samples](https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/audio-0.9.3.tar.gz)


## Voskjs usage examples 

1. Download this repository 

   ```bash
   cd && git clone https://github.com/solyarisoftware/voskJs
   ```

2. Some examples [here](examples) 


## Tests

Some tests / notes [here](tests/README.md)


## Notes

1. Latency

   Vosk ASR is fast! Run-time latency for file `./audio/2830-3980-0043.wav`
   using English large model, is just 428 ms on my laptop. 

   Weirdly the English small model performances are worst, with 598ms. Not clear to me. 

2. Comparison between Vosk and Mozilla DeepSpeech (latencies)

   For the comparison I used [DeepSpeechJs](https://github.com/solyarisoftware/DeepSpeechJs), 
   my simple nodejs interface to Deepspeech. See results [here](tests/README.md).


## To do

- Improve the HTTP server
- Improve stress / performances tests (especially for the HTTP server)
- Deliver a npm package


## Acknowledgments

Thanks to Nicolay V. Shmyrev, author of Vosk project, 
also for the help about nodeJs API bindings for multi-threading management. 

See also: 
- [What's the Vosk CPU usage at run-time?](https://github.com/alphacep/vosk-api/issues/498)
- [How to set-up a Vosk multi-threads server architecture in NodeJs](https://github.com/alphacep/vosk-api/issues/502) 


## License

MIT (c) Giorgio Robino 

---

[top](#)
