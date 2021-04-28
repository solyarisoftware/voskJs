# VoskJs

Vosk ASR engine runtime transcript NodeJs client.

## What's Vosk?

Vosk is an open-source speech recognition engine/toolkit, by Nikolay V. Shmyrev. 
Documentation:

- https://alphacephei.com/vosk/
- https://github.com/alphacep/vosk-api

## What's VoskJs?

The goal of the simple project is to:

1. create a function easy layer on top of already existing Vosk nodejs binding, supplying 3 functions: 

   - `loadModel()`
   - `transcript()`
   - `freeModel()`

   In that way you can embed the voskjs module in your nodejs program, 
   accessing async functions for a correct behavior on an usual sigle thread nodejs program.

   > NOTE:
   > This solution is suitable for single user (sequential) requests, for an embedded system, 
   > not a server with multiple concurrent users requests. 
   > For this last case I'll soon provide a separated server-based solution using nodejs workers threads

2. `voskjs` program can be easily used as command line test system (some tests [here](tests/README.md)).

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

This repo contains in `audio/` directory, few English language speech audio files, coming from Mozilla Deespeech repo.
Useful to make some tests and comparisons. 

Source: https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/audio-0.9.3.tar.gz


## VoskJs Command line usage examples

```bash
$ node voskjs

usage:

    node voskjs --model=<model directory> --audio=<audio file name>

example:

    node voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2
```


## Use Voskjs module function in your program

1. Download this repo 

   ```bash
   cd && git clone https://github.com/solyarisoftware/voskJs
   ```

2. Embed the voskjs module in your program 

   ```javascript
   const { initModel, transcript, freemodel } = require('~/voskJs/voskjs')

   const englishModelDirectory = 'models/vosk-model-en-us-aspire-0.2'
   const audioFile = 'audio/2830-3980-0043.wav'

   // create a runtime model
   const englishModel = await initModel(englishModelDirectory)

   // speech recognition from an audio file
   try {
     const result = await transcript(audioFile, englishModel) 

     console.log(result)
   }  
   catch(error) {
     console.error(error) 
   }  

   // free the runtime model
   freeModel(englishModel)
   ```

## Tests

Some tests / notes [here](tests/README.md)


## Notes

1. Latency

   Vosk ASR is pretty fast; runtime latency for file `./audio/2830-3980-0043.wav`
   using English large model, is just 428 ms. 

   Weirdly the English small model perforom worst, with 598ms. Not clear to me. 

2. Comparison between Vosk and Mozilla DeepSpeech (latencies)

   For the comparison I used [DeepSpeechJs](https://github.com/solyarisoftware/DeepSpeechJs), 
   my simple nodejs interface to Deepspech. See results [here](tests/README.md).


3. Single-user VS Multi-user multi-core architecture

   The current solution embed vosk API into async functions. That's ok for a single-user / embedded system nodejs program. 

   Vosk transcript is a cpu-bound task that occupy a single core at 100% cpu for some hundreds of msecs.
   See also: [What's the Vosk CPU usage at run-time?](https://github.com/alphacep/vosk-api/issues/498)
 
   So to manage concurrent user requests (a server) a different architecture, using thread workers, must be developed.


## To do

 - To build a server based angine, with multiple concurrent requests, 
   the single thread async functions approach must be substituted using an alternative worker thread architecture.

- Deliver a npm package


## Change log

- 0.0.15 

  Added tests directory, containing some stress tests results

- 0.0.14 
 
  Transcript function updated to integrate Vosk version 0.3.25 (`npm install vosk@latest`), 
  where the function `rec.acceptWaveformAsync` now run on a separated external thread!


## License

MIT (c) Giorgio Robino 


---

[top](#)
