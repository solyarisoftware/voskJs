# README

## Documentation

- https://alphacephei.com/vosk/
- https://github.com/alphacep/vosk-api


## Installation

- `pip3 install vosk `See https://alphacephei.com/vosk/install
- `npm install vosk`

## Download models

- `wget https://alphacephei.com/vosk/models/vosk-model-en-us-aspire-0.2.zip`
- `wget http://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip`
- `wget https://alphacephei.com/vosk/models/vosk-model-small-it-0.4.zip`


## Command line usage

```
$ node transcript --audio=audio/8455-210777-0068.wav --model=models/vosk-model-en-us-aspire-0.2

log level          : 0

LOG (VoskAPI:ReadDataFiles():model.cc:194) Decoding params beam=13 max-active=7000 lattice-beam=6
LOG (VoskAPI:ReadDataFiles():model.cc:197) Silence phones 1:2:3:4:5:6:7:8:9:10:11:12:13:14:15
LOG (VoskAPI:RemoveOrphanNodes():nnet-nnet.cc:948) Removed 1 orphan nodes.
LOG (VoskAPI:RemoveOrphanComponents():nnet-nnet.cc:847) Removing 2 orphan components.
LOG (VoskAPI:Collapse():nnet-utils.cc:1488) Added 1 components, removed 2
LOG (VoskAPI:CompileLooped():nnet-compile-looped.cc:345) Spent 0.00636292 seconds in looped compilation.
LOG (VoskAPI:ReadDataFiles():model.cc:221) Loading i-vector extractor from models/vosk-model-en-us-aspire-0.2/ivector/final.ie
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:183) Computing derived variables for iVector extractor
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:204) Done.
LOG (VoskAPI:ReadDataFiles():model.cc:246) Loading HCLG from models/vosk-model-en-us-aspire-0.2/graph/HCLG.fst
LOG (VoskAPI:ReadDataFiles():model.cc:265) Loading words from models/vosk-model-en-us-aspire-0.2/graph/words.txt
LOG (VoskAPI:ReadDataFiles():model.cc:273) Loading winfo models/vosk-model-en-us-aspire-0.2/graph/phones/word_boundary.int
LOG (VoskAPI:ReadDataFiles():model.cc:281) Loading CARPA model from models/vosk-model-en-us-aspire-0.2/rescore/G.carpa

init elapsed       : 2102ms
transcript elapsed : 589ms

{
  result: [
    { conf: 0.976566, end: 0.72, start: 0.57, word: 'your' },
    { conf: 0.924899, end: 1.05, start: 0.72, word: 'power' },
    { conf: 1, end: 1.23, start: 1.054631, word: 'is' },
    { conf: 1, end: 1.74, start: 1.23, word: 'sufficient' },
    { conf: 1, end: 1.83, start: 1.74, word: 'i' },
    { conf: 0.939465, end: 2.16, start: 1.83, word: 'said' }
  ],
  text: 'your power is sufficient i said'
}

```
