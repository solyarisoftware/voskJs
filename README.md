# VoskJs

Vosk ASR engine runtime transcript NodeJs native client.
With some examples and notes.

## What's Vosk?

Vosk is an open-source speech recognition engine/toolkit. Documentation:

- https://alphacephei.com/vosk/
- https://github.com/alphacep/vosk-api

## What's VoskJs?

The goal of the simple project is to:

1. create a function easy layer on top of already existing Vosk nodejs binding, supplying 3 functions: 

   - `loadModel()`
   - `transcript()`
   - `freeModel()`

   In that way you can embed the voskjs module in your nodejs "server" program, 
   accessing async functions with best performance at runtime.

2. voskjs program could be easily used as command line test system.

## Install 

### 1. Install Vosk engine and relative nodejs module

```bash
pip3 install vosk 
npm install vosk
```

See https://alphacephei.com/vosk/install


### 2. Install/Download Vosk models

See https://alphacephei.com/vosk/models

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

### 2. Demo audio files

The repo contains in `audio/` directory, few English language speech audio files, coming from Mozilla Deespeech repo.
Useful to make some tests and comparisons. Source: https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/audio-0.9.3.tar.gz


## VoskJs Command line usage examples

```bash
$ node voskjs.js 

usage:

    node voskjs \ 
         --model=<model directory> \ 
         --audio=<audio file name>

example:

    node voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2

$ node voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2

```

### Transcript using English language, large model

```bash
$ node voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2

log level          : 0

LOG (VoskAPI:ReadDataFiles():model.cc:194) Decoding params beam=13 max-active=7000 lattice-beam=6
LOG (VoskAPI:ReadDataFiles():model.cc:197) Silence phones 1:2:3:4:5:6:7:8:9:10:11:12:13:14:15
LOG (VoskAPI:RemoveOrphanNodes():nnet-nnet.cc:948) Removed 1 orphan nodes.
LOG (VoskAPI:RemoveOrphanComponents():nnet-nnet.cc:847) Removing 2 orphan components.
LOG (VoskAPI:Collapse():nnet-utils.cc:1488) Added 1 components, removed 2
LOG (VoskAPI:CompileLooped():nnet-compile-looped.cc:345) Spent 0.006459 seconds in looped compilation.
LOG (VoskAPI:ReadDataFiles():model.cc:221) Loading i-vector extractor from models/vosk-model-en-us-aspire-0.2/ivector/final.ie
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:183) Computing derived variables for iVector extractor
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:204) Done.
LOG (VoskAPI:ReadDataFiles():model.cc:246) Loading HCLG from models/vosk-model-en-us-aspire-0.2/graph/HCLG.fst
LOG (VoskAPI:ReadDataFiles():model.cc:265) Loading words from models/vosk-model-en-us-aspire-0.2/graph/words.txt
LOG (VoskAPI:ReadDataFiles():model.cc:273) Loading winfo models/vosk-model-en-us-aspire-0.2/graph/phones/word_boundary.int
LOG (VoskAPI:ReadDataFiles():model.cc:281) Loading CARPA model from models/vosk-model-en-us-aspire-0.2/rescore/G.carpa

init elapsed       : 2081ms
transcript elapsed : 428ms

{
  result: [
    { conf: 0.980891, end: 1.02, start: 0.33, word: 'experience' },
    { conf: 1, end: 1.349903, start: 1.02, word: 'proves' },
    { conf: 0.996779, end: 1.71, start: 1.35, word: 'this' }
  ],
  text: 'experience proves this'
}


```

### Transcript using English language, small model

```bash
$ node voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-small-en-us-0.15

log level          : 0

LOG (VoskAPI:ReadDataFiles():model.cc:194) Decoding params beam=10 max-active=3000 lattice-beam=2
LOG (VoskAPI:ReadDataFiles():model.cc:197) Silence phones 1:2:3:4:5:6:7:8:9:10
LOG (VoskAPI:RemoveOrphanNodes():nnet-nnet.cc:948) Removed 0 orphan nodes.
LOG (VoskAPI:RemoveOrphanComponents():nnet-nnet.cc:847) Removing 0 orphan components.
LOG (VoskAPI:CompileLooped():nnet-compile-looped.cc:345) Spent 0.0248089 seconds in looped compilation.
LOG (VoskAPI:ReadDataFiles():model.cc:221) Loading i-vector extractor from models/vosk-model-small-en-us-0.15/ivector/final.ie
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:183) Computing derived variables for iVector extractor
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:204) Done.
LOG (VoskAPI:ReadDataFiles():model.cc:251) Loading HCL and G from models/vosk-model-small-en-us-0.15/graph/HCLr.fst models/vosk-model-small-en-us-0.15/graph/Gr.fst
LOG (VoskAPI:ReadDataFiles():model.cc:273) Loading winfo models/vosk-model-small-en-us-0.15/graph/phones/word_boundary.int

init elapsed       : 1343ms
transcript elapsed : 598ms

{
  result: [
    { conf: 1, end: 1.02, start: 0.36, word: 'experience' },
    { conf: 1, end: 1.35, start: 1.02, word: 'proves' },
    { conf: 1, end: 1.74, start: 1.35, word: 'this' }
  ],
  text: 'experience proves this'
}
```

## Use Voskjs module function in your program

```javascript
const { initModel, transcript, freemodel } = require('voskjs')

const modelDirectory = 'models/vosk-model-en-us-aspire-0.2'
const audioFile = 'audio/2830-3980-0043.wav'

// create a runtime model
const model = await initModel(modelDirectory)

// speech recognition from an audio file
try {
  const result = await transcript(audioFile, model) 

  console.log(result)
  console.log()
}  
catch(error) {
  console.error(error) 
}  

// free the runtime model
freeModel(model)
```


## Notes

1. **Latency**

   Vosk ASR is pretty fast; runtime latency for file `./audio/2830-3980-0043.wav`
   using English large model, is just 428 ms. 

   Weirdly the English small model perforom worst, with 598ms. Not clear to me. 

2. **Comparison with Mozilla DeepSpeech**

   For the comparison I used my simple nodejs interface to Deepspech: 
   https://github.com/solyarisoftware/DeepSpeechJs 

   I used the last DeepSpeech English model and I tested audio file `./audio/2830-3980-0043.wav`:

   ```bash
   $ node deepSpeechTranscriptNative ./models/deepspeech-0.9.3-models.pbmm ./models/deepspeech-0.9.3-models.scorer ./audio/2830-3980-0043.wav 

   usage: node deepSpeechTranscriptNative [<model pbmm file>] [<model scorer file>] [<audio file>]
   using: node deepSpeechTranscriptNative ./models/deepspeech-0.9.3-models.pbmm ./models/deepspeech-0.9.3-models.scorer ./audio/2830-3980-0043.wav

   TensorFlow: v2.3.0-6-g23ad988
   DeepSpeech: v0.9.3-0-gf2e9c85
   2021-04-19 10:36:35.255124: I tensorflow/core/platform/cpu_feature_guard.cc:142] This TensorFlow binary is optimized with oneAPI Deep Neural Network Library (oneDNN)to use the following CPU instructions in performance-critical operations:  AVX2 FMA
   To enable them in other operations, rebuild TensorFlow with the appropriate compiler flags.

   pbmm      : ./models/deepspeech-0.9.3-models.pbmm
   scorer    : ./models/deepspeech-0.9.3-models.scorer
   elapsed   : 10ms

   audio file: ./audio/2830-3980-0043.wav
   transcript: experience proves this
   elapsed   : 1022ms
   ```

   Result shows that Mozilla DeepSpeech latency here is 1022ms whereas Vosk latency is 428ms. 
   **Vosk speeech recognition is ~238% faster than Deepspeech!**

3. **Async functions architecture**

   Considering a server environment, so far is not clear to me how convenient is to have the transcript as an async function. 
   I have to measure the CPU(s) involved each time the transcript is called, to eventually decide a different architecture, as using thread workers.
   Open point to be verified.


## License

MIT (c) Giorgio Robino 

---
