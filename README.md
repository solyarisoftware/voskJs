# VoskJs

Vosk ASR offline engine transcript APIs for NodeJs developers.
Contains a simple HTTP transcript server.

VoskJs can be used for speech recognition processing in different scenarios:
- Single-user/standalone programs (e.g. perfect for single-user embedded systems) 
- Multi-user/multi-core server architectures 


## What's Vosk?

Vosk is an open source embedded (offline, on-device) speech-to-text engine 
which can run in real time also on small devices.
It's based on Kaldi. Made by Nikolay V. Shmyrev. 

Documentation:
- https://alphacephei.com/vosk/
- https://github.com/alphacep/vosk-api

## What's VoskJs?

The goal of the project is to:

1. Create an simple function API layer on top of already existing Vosk nodejs binding, 
   supplying two main functionalities: 

   - `loadModel(modelDirectory)`
 
     Loads once in RAM memory a specific Vosk engine model from a model directory.
 
   - `transcript(fileName, model, options)` 

     At run-rime, transcripts a speech file (in WAV format), 
     through the Vosk engine Recognizer. It supply speech-to-text transcript detailed info.

   Using the simple transcript interface you can build:
   - Your standalone nodejs application, 
     accessing async functions suitable to run on a usual single thread nodejs program.
   - Your custom servers, considering that transcript wraps Vosk Recognizer multithread capability.

2. Use `voskjs` command line program to test Vosk transcript with specific models 
  (some tests and command line usage [here](tests/README.md)).

3. Setup a simple HTTP server to transcript speech files. 
   Usage examples [here](examples/). 


## Install 

### 1. Install Vosk engine and relative nodejs modules

```bash
# 1. install vosk-api engine
pip3 install vosk 

# 2. install vosk-api nodejs binding module
npm install vosk

# 3. install this module as local package 
npm install @solyarisoftware/voskjs

# 3. or install this module as global package, to use CLI command voskjs 
npm install -g @solyarisoftware/voskjs
```

See also: https://alphacephei.com/vosk/install


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

cd ..
```

More about available Vosk models here: https://alphacephei.com/vosk/models

### 3. Demo audio files

Directory [`audio`](audio/) contains some English language speech audio files, 
coming from a Mozilla DeepSpeech repo.
Source: [Mozilla DeepSpeech audio samples](https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/audio-0.9.3.tar.gz)

These files are used for some tests and comparisons.


## Usage examples 

Some transcript usage examples [here](examples) 

- [VoskJs command line usage](examples/README.md#voskjs-command-line-usage)
- [Simple transcript program](examples/README.md#simple-transcript-program) 
- [Transcript with grammar](examples/README.md#transcript-with-grammar) 
- [Transcript HTTP server](examples/README.md#transcript-http-server)


## Tests

Some tests / notes [here](tests/README.md):

- [Transcript using English language, large model](tests/README.md#transcript-using-english-language-large-model)
- [Transcript using English language, small model](tests/README.md#transcript-using-english-language-small-model)
- [Comparison between Vosk and Mozilla DeepSpeech (latencies)](tests/README.md#comparison-between-vosk-and-mozilla-deepspeech-latencies)
- [Multithread stress test (10 requests in parallel)](tests/README.md#multithread-stress-test-10-requests-in-parallel)
- [HTTP Server benchmark test](tests/README.md#http-server-benchmark-test)


## To do

- Important issue to be solved: https://github.com/solyarisoftware/voskJs/issues/3 
  with workaround: https://github.com/alphacep/vosk-api/issues/516#issuecomment-833462121
- Function transcript could get buffer instead of a WAV
- Review stress / performances tests (especially for the HTTP server)


## How to contribute

Any contribute is welcome. 
- [Discussions](https://github.com/solyarisoftware/voskJs/discussions). 
  Please open a new discussion (a publich chat on github) for any specific open topic, 
  for a clarification, change request proposals, etc.
- [Issues](https://github.com/solyarisoftware/voskJs/issues).
- [e-mail](giorgio.robino@gmail.com)
  You can contact me privately, via email.


## Credits

Thanks to Nicolay V. Shmyrev, author of Vosk project, 
also for the help about nodeJs API bindings for multi-threading management. 

See also: 
- [What's the Vosk CPU usage at run-time?](https://github.com/alphacep/vosk-api/issues/498)
- [How to set-up a Vosk multi-threads server architecture in NodeJs](https://github.com/alphacep/vosk-api/issues/502) 


## License

[MIT](LICENSE.md) (c) Giorgio Robino 

---

[top](#)
