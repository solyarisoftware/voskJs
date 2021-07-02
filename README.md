# VoskJs

VoskJs is a NodeJs developers toolkit to use [Vosk](https://alphacephei.com/vosk/) 
offline speech recognition engine, including multi thread (server) usage examples. 
The project gives you: 

- A simple sentence-based and streaming-based transcript APIs
- The command line utility `voskjs`
- A demo HTTP transcript server `voskjshttp`

VoskJs can be used for speech recognition processing in different scenarios:

- Single-user/standalone programs (e.g. perfect for single-user embedded systems) 
- Multi-user/multi-core server architectures 


## What's Vosk?

Vosk is an open source embedded (offline/on-prem) speech-to-text engine 
which can run with very low latencies (`< 500`msecs on my [PC](tests/README.md#my-hardware--host-configuration)).
Vosk is based on a common DNN-HMM architecture.  Deep neural network is used for sound scoring (acoustic scoring), 
HMM and WFST frameworks are used for time models (language models).
It's based on [Kaldi](https://github.com/kaldi-asr/kaldi),
but Nikolay V. Shmyrev's Vosk offers a smart, simplified and performing interface! 
More details in the [Vosk home page](https://alphacephei.com/vosk/) 
and [github repo](https://github.com/alphacep/vosk-api).


## What's VoskJs?

The goal of the project is to create an simple function API layer 
on top of already existing Vosk nodejs binding, 
supplying both sentence-based and streaming-based speech-to-text functionalities.

### Sentence-based transcript API

In this mode, a file or a PCM buffer are processed asynchronously, 
to get the full text transcript of the given speech. 
Using the simple transcript interface you can build your standalone custom application, 
accessing async functions suitable to run on a usual single thread nodejs program.

Pseudo code:

```javascript
//Loads once in RAM memory a specific Vosk engine model from a model directory.
const model = loadModel(modelDirectory)

// transcripts a speech file or buffer (in WAV/PCM format), using Vosk engine. 
// It supply speech-to-text transcript detailed info.
const result = await transcriptFromFile(fileName, model, {options}) 

// or 
// const result = await transcriptFromBuffer(buffer, model, {options}) 

freeModel(model)
```

### Streaming-based transcript API (DRAFT)

Following Vosk-api recognizer result functions, VoskJs emit these nodejs events:

| Event name    | Vosk-api recognizer function | description                                 |
| ------------- | ---------------------------- | ------------------------------------------- |
| `partial`     | recognizer.patialResult()    | silent (text = '') or new word or new words |
| `endOfSpeech` | recognizer.result()          | end of speech (words followed by a silence) |
| `final`       | recognizer.finalResult()     | last part of the audio                      |

Pseudo code:

```javascript
//Loads once in RAM memory a specific Vosk engine model from a model directory.
const model = loadModel(modelDirectory)

const transcriptEvents = transcriptEventsFromFile(fileName, model, {options}) 
// or
// const transcriptEvents = transcriptEventsFromBuffer(buffer, model, {options}) 

// an new word is detected
transcriptEvents.on('partial', data => console.log(data) ) 

// a complete sentence (followed by silence) is detected 
transcriptEvents.on('endOfSpeech', data => console.log(data) )

// final (last) sentence is detected
transcriptEvents.on('final', data => console.log(data) )

freeModel(model)
```


### Command line tools

- `voskjs`: command line program to test Vosk transcript with specific models 
  (some tests and command line usage [here](tests/README.md)).

  BTW the utility can be configured to tabularize events. By example:

  ```
  voskjs --audio=audio/sentencesWithSilences.wav --model=models/vosk-model-small-en-us-0.15 --tableevents
  ```
  ```
  voskjs is a CLI utility to test Vosk-api features
  package @solyarisoftware/voskjs version 1.2.7, Vosk-api version 0.3.30

  Statistics:

  model directory      : models/vosk-model-small-en-us-0.15
  speech file name     : audio/sentencesWithSilences.wav
  grammar              : not specified. Default: NO
  sample rate          : not specified. Default: 16000
  max alternatives     : undefined
  text only / JSON     : JSON
  Vosk debug level     : -1

  load model latency   : 2001ms
  transcript latency   : 1707ms
  transcript text      : one two three four five six seven eight nine zero one two three stop 

  Events table:

  | time   | event        | text                                     |
  | ------ | ------------ | ---------------------------------------- |
  |     66 | partial      | 
  |    489 | partial      | one
  |    538 | partial      | one two
  |    592 | partial      | one two three
  |    635 | endOfSpeech  | one two three
  |    668 | partial      | 
  |    847 | partial      | for
  |    882 | partial      | four five six
  |    977 | partial      | four five six seven
  |   1099 | partial      | four five six seven eight
  |   1169 | endOfSpeech  | four five six seven eight
  |   1194 | partial      | 
  |   1322 | partial      | nine
  |   1381 | partial      | nine zero
  |   1456 | partial      | nine zero one
  |   1498 | partial      | nine zero one two
  |   1550 | partial      | nine zero one two three
  |   1630 | partial      | nine zero one two three stop
  |   1649 | endOfSpeech  | nine zero one two three stop
  |   1677 | partial      | 
  |   1706 | final        | 
  ```

- `voskjshttp`: a simple demo HTTP server to transcript speech files. 
  Using above API you can build your own server. Some usage examples [here](examples/).


## 🛍 Install 

### 1. Install Vosk engine and this nodejs module 

- Install vosk-api engine
  ```bash
  pip3 install -U vosk 
  ```
  See also: https://alphacephei.com/vosk/install

- Install this module, as global package if you want to use CLI command `voskjs` 
  ```bash
  npm install -g @solyarisoftware/voskjs@latest
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


## 🧐 [Examples](examples/README.md)

Some VoskJs usage examples:

- [Simple program for a sentence-based speech-to-text](examples/README.md#simple-program-for-a-sentence-based-speech-to-text)
- [`voskjs` Command line utility](examples/README.md#voskjs-command-line-utility)
- [`voskjshttp` demo speech-to-text HTTP server](examples/servers.md#voskjshttpjs-demo-spech-to-text-http-server)
- [`voskjshttp` as RHASSPY speech-to-text remote HTTP Server](examples/servers.md#voskjshttp-as-rhasspy-speech-to-text-remote-http-server)
- [Sentence-based speech-to-text, specifying a grammar](examples/grammars.md#sentence-based-speech-to-text-specifyng-a-grammar)
- [SocketIO server pseudocode](examples/servers.md#socketio-server-pseudocode)


## 🛠 [Tests](tests/README.md)

Some tests/notes:

- Transcript using English language, large model
- Transcript using English language, small model
- Comparison between Vosk and Mozilla DeepSpeech (latencies)
- Multi-thread stress test (10 requests in parallel)
- HTTP Server benchmark test
- Latency tests


## 🎁 Bonus track

[`audioutils`](lib/audioutils.js) some audio utility functions as `toPCM`, 
a fast transcoding to PCM, using ffmpeg process (install ffmpeg before).


## To do

- To speedup latencies, rethink transcript interface, maybe with an initialization phases, 
  including Model and Recognizer(s) object creation.
  Possible architecture: [Stateful & low latency ASR architecture](https://github.com/alphacep/vosk-api/issues/553)
- Deepen grammar usage with more examples
- Deepen Vosk-API errors catching
- `voskjshttp`: 
  - Review stress and performances tests (especially for the HTTP server)
  - HTTP POST management: 
    - set mandatory audio format mime type in the header request (`--header "Content-Type: audio/wav"`)
    - audio-transcoding using function `toPcm` 
      if input speech files are not specified as wav in header request (e.g. `--header "Content-Type: audio/webm"`)
      see https://cloud.ibm.com/docs/speech-to-text?topic=speech-to-text-audio-formats#audio-formats-list


## How to contribute

If you like the project, please ⭐️ star this repository to show your support! 🙏

Any contribute is welcome: 
- [Discussions](https://github.com/solyarisoftware/voskJs/discussions). 
  Please open a new discussion (a publich chat on github) for any specific open topic, 
  for a clarification, change request proposals, etc.
- [Issues](https://github.com/solyarisoftware/voskJs/issues) Please submit issues for bugs, etc
- [e-mail](giorgio.robino@gmail.com) You can contact me privately, via email


## 💣 Status

- Project is in a very draft stage
- Warning: multi-threading causes a crash: https://github.com/solyarisoftware/voskJs/issues/3
  The issue has a temporary workaround: https://github.com/alphacep/vosk-api/issues/516#issuecomment-833462121


## 🙏 Credits

Thanks to Nicolay V. Shmyrev, author of [Vosk](https://alphacephei.com/vosk/) project,
for the help about nodeJs API bindings for multi-threading management


## License

[MIT](LICENSE.md) (c) Giorgio Robino 

---

[top](#)
