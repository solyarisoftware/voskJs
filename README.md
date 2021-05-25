# VoskJs

VoskJs is a NodeJs developers toolkit to use [Vosk](https://alphacephei.com/vosk/) offline speech recognition engine. 
It give you: 
- simple sentence-based transcript APIs
- command line utility `voskjs`
- demo HTTP transcript server `voskjshttp`.

VoskJs can be used for speech recognition processing in different scenarios:

- Single-user/standalone programs (e.g. perfect for single-user embedded systems) 
- Multi-user/multi-core server architectures 


## What's Vosk?

Vosk is an open source embedded (offline/on-prem) speech-to-text engine 
which can run with very low latencies (`< 500msecs`) on small devices.

Vosk is based on a common DNN-HMM architecture. 
Deep neural network is used for sound scoring (acoustic scoring), 
HMM and WFST frameworks are used for time models (language models).
It's based on [Kaldi](https://github.com/kaldi-asr/kaldi), 
but Nikolay V. Shmyrev's Vosk offers a smart, simplified and performant interface! 

Documentation:
- https://alphacephei.com/vosk/
- https://github.com/alphacep/vosk-api

## What's VoskJs?

The goal of the project is to:

1. Create an simple function API layer on top of already existing Vosk nodejs binding, 
   supplying main sentence-based speech-to-text functionalities: 

   - `const model = loadModel(modelDirectory)`
 
     Loads once in RAM memory a specific Vosk engine model from a model directory.
 
   - `transcriptFromFile(fileName, model, options)` 
   - `transcriptFromBuffer(buffer, model, options)` 

     At run-rime, transcripts a speech file or buffer (in WAV/PCM format), 
     through the Vosk engine Recognizer. It supply speech-to-text transcript detailed info.

   - `freeModel(mode)`

   Using the simple transcript interface you can build your standalone custom application, 
   accessing async functions suitable to run on a usual single thread nodejs program.

2. `voskjs` 

   command line program to test Vosk transcript with specific models 
   (some tests and command line usage [here](tests/README.md)).

3. `voskjshttp`

   a simple demo HTTP server to transcript speech files. 

4. Build your own server. Some usage examples [here](examples/).


## 🛍 Install 

### 1. Install Vosk engine and this nodejs module 

- Install vosk-api engine
  ```bash
  pip3 install vosk 
  ```
  See also: https://alphacephei.com/vosk/install

- Install this module, as global package if you want to use CLI command `voskjs` 
  ```bash
  npm install -g @solyarisoftware/voskjs
  ```


### 2. Install/Download Vosk models

```bash
mkdir your/path/models && cd models

# English large model
wget https://alphacephei.com/vosk/models/vosk-model-en-us-aspire-0.2.zip
unzip vosk-model-en-us-aspire-0.2.zip

# English small model
wget http://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip

# Italian model model
wget https://alphacephei.com/vosk/models/vosk-model-small-it-0.4.zip
unzip vosk-model-small-it-0.4.zip
```

More about available Vosk models here: https://alphacephei.com/vosk/models

### 3. Demo audio files

Directory [`audio`](audio/) contains some English language speech audio files, 
coming from a Mozilla DeepSpeech repo.
Source: [Mozilla DeepSpeech audio samples](https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/audio-0.9.3.tar.gz)
These files are used for some tests and comparisons.


## 🧐 Examples

Some VoskJs usage examples:

- `voskjs` Command line utility
- `voskjshttp` demo spech-to-text HTTP server 
- Simple program for a sentence-based speech-to-text
- Sentence-based speech-to-text, specifyng a grammar
- SocketIO server pseudocode

All details [here](examples) 


## 🛠 Tests

Some tests/notes:

- Transcript using English language, large model
- Transcript using English language, small model
- Comparison between Vosk and Mozilla DeepSpeech (latencies)
- Multithread stress test (10 requests in parallel)
- HTTP Server benchmark test
- Latency tests

All details [here](tests/README.md):


## 🎁 Bonus track

[`toPcm`](lib/toPCM.js) fast transcoding to PCM, using ffmpeg process 


## 🤔 To do

- To speedup latencies, rethink transcript interface, maybe with an initialization phases, 
  including Model and Recognizer(s) object creation.
  See proposal architecture: https://github.com/alphacep/vosk-api/issues/553
- Implement interfaces for all [Vosk-api functions](https://github.com/alphacep/vosk-api/blob/master/nodejs/index.js)
- Deepen grammar usage with examples
- add to voskjs sampling rate parameter
- Vosk-API errors catching
- httpserver 
  - Review stress and performances tests (especially for the HTTP server)
  - HTTP POST management: set mandatory audio format mime type in the header request (`--header "Content-Type: audio/wav"`)
  - HTTP POST management: audio-transcoding using `toPcm()` 
    if input speech files are not specified as wav in header request (`--header "Content-Type: audio/webm"`)
    see https://cloud.ibm.com/docs/speech-to-text?topic=speech-to-text-audio-formats#audio-formats-list


## ✋ How to contribute

Any contribute is welcome. 
- [Discussions](https://github.com/solyarisoftware/voskJs/discussions). 
  Please open a new discussion (a publich chat on github) for any specific open topic, 
  for a clarification, change request proposals, etc.
- [Issues](https://github.com/solyarisoftware/voskJs/issues) Please submit issues for bugs, etc
- [e-mail](giorgio.robino@gmail.com) You can contact me privately, via email


## 💣 Status

- Project is in a very draft stage
- Warning: multithreading causes a crash: https://github.com/solyarisoftware/voskJs/issues/3
  The issue has a temporary workaround: https://github.com/alphacep/vosk-api/issues/516#issuecomment-833462121


## 🙏 Credits

Thanks to Nicolay V. Shmyrev, author of [Vosk](https://alphacephei.com/vosk/) project,
for the help about nodeJs API bindings for multi-threading management

See also: 
- [What's the Vosk CPU usage at run-time?](https://github.com/alphacep/vosk-api/issues/498)
- [How to set-up a Vosk multi-threads server architecture in NodeJs](https://github.com/alphacep/vosk-api/issues/502) 


## License

[MIT](LICENSE.md) (c) Giorgio Robino 

---

[top](#)
