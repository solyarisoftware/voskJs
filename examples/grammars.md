# Using Vosk grammars

- [Sentence-based speech-to-text, specifyng a grammar](#sentence-based-speech-to-text-specifyng-a-grammar)
- [💡 Stateful & low latency ASR. Proposed architecture](#-stateful--low-latency-asr-proposed-architecture)


## Sentence-based speech-to-text, specifyng a grammar   

[`grammar.js`](grammar.js) is a basic demo using Vosk recognizer using a specified grammar.
The output structure format now allows dofferent alternatives)

```bash
node grammar
```
```
$ node grammar.js
model directory      : ../models/vosk-model-small-en-us-0.15
speech file name     : ../audio/2830-3980-0043.wav
grammar              : experience proves this,why should one hold on the way,your power is sufficient i said,oh one two three four five six seven eight nine zero,[unk]
load model latency   : 328ms
{
  alternatives: [
    {
      confidence: 197.583099,
      result: [
        { end: 1.02, start: 0.36, word: 'experience' },
        { end: 1.35, start: 1.02, word: 'proves' },
        { end: 1.98, start: 1.35, word: 'this' }
      ],
      text: ' experience proves this'
    }
  ]
}
transcript latency : 118ms
```

IMPORTANT: 
**latency is very low if grammar sentences are provided!**

See details here: 
- https://github.com/alphacep/vosk-api/blob/master/nodejs/index.js#L198
- https://github.com/alphacep/vosk-api/blob/91a128b3edf7e84d55649d8fa9a60664b5386292/src/vosk_api.h#L114
- https://github.com/alphacep/vosk-api/issues/500

That's not an issue, just a question/discussion for you/everyone about the proposed architecture.

Preamble about latencies
Vosk decoding latencies time are very fast! On my PC, for short (few words) utterances transcripts I got:

1. Using grammar-based models (e.g. pretrained model model-small-en-us-0.15) 
   - If I DO NOT specify any grammar I achieve latency of ~500-600 msecs 
   - If I DO specify a grammar (also pretty long) I achieve few tents of msecs ( `<<` 100 msecs)
2. Using large / static graph model (e.g. vosk-model-en-us-aspire-0.2), I got ~400-500 msec latency (with a better accuracy for open-domain utterances). 


## 💡 Stateful & low latency ASR. Proposed architecture

Considering a stateful (task-oriented closed-domain) voice-assistant platform, I want to experiment how much can I slow-down latencies, with a stateful ASR. My idea is to connect Vosk ASR with a state-based dialog manager (as my own opensource [NaifJs](https://github.com/solyarisoftware/naifjs)),

Workflow:

1. Initialization phase:
   - to load model that allow grammars (e.g. model model-small-en-us-0.15) 
   -  to prepare/create N different Vosk Recognizers for each `grammar(N) ` (one grammar for for each `state(N)` ) 

 2. Run-time (decoding time)
    - a "Decode Manager" decides which Recognizer us to be used, depending on the state injected by the dialog manager
    - The Decode Manager could use a fallback Recognizer, based on the original model, without a grammar specified for a final decision

See the diagram:

```
                       state(S-1) -> grammar(S-1)
                      ┌────────────────────────────────────────────────────────────┐
                      │                                                            │
                      │                                                            │
                      │                                                            │
                      │       (1)                                                  │
           ┌──────────▼─────────┐                                                  │
           │                    │                                                  │
           │                    │                                (2)               │
           │                    │   ┌──────────────┐   ┌───────────┐               │
           │                    │   │              │   │           │               │
           │                    │   │ Grammar 1    │   │           │               │
           │                    ◄───┤ Recognizer 1 ◄───┤           │               │
           │                    │   │              │   │           │               │   (3)
           │                    │   │              │   │           │         ┌─────┴─────┐
           │                    │   └──────────────┘   │           │         │           │
           │                    │                      │           │         │           │
           │                    │   ┌──────────────┐   │           │         │           │
           │                    │   │              │   │           │         │           │
           │                    │   │ Grammar 2    │   │           │         │           │
           │                    ◄───┤ Recognizer 2 ◄───┤           │         │           │
           │                    │   │              │   │           │         │           │
           │                    │   │              │   │           │         │           │
           │                    │   └──────────────┘   │           │         │           │
pcm audio  │       DECODER      │                      │  MODEL    │         │  DIALOG   │
───────────►       MANAGER      │   ┌──────────────┐   │  ALLOWING │         │  MANAGER  ├───────►
           │                    │   │              │   │  GRAMMARS │         │           │
           │                    │   │ Grammar N    │   │           │         │           │
           │                    ◄───┤ Recognizer N ◄───┤           │         │           │
           │                    │   │              │   │           │         │           │
           │                    │   │              │   │           │         │           │
           │                    │   └──────────────┘   │           │         │           │
           │                    │                      │           │         │           │
           │                    │                      │           │         │           │
           │                    │                      │           │         │           │
           │                    │   ┌──────────────┐   │           │         │           │
           │                    │   │              │   │           │         │           │
           │                    │   │ No-Grammar   │   │           │         └─────▲─────┘
           │                    ◄───┤ Recognizer 0 ◄───┤           │               │
           │                    │   │              │   │           │               │
           │                    │   │              │   │           │               │
           │ ┌────────────────┐ │   └──────────────┘   └───────────┘               │
           │ │ acceptWaveForm │ │                                                  │
           │ │                │ │                                                  │
           │ └───────┬────────┘ │                                                  │
           │         │          │                                                  │
           │         │          │                                                  │
           └─────────┼──────────┘                                                  │
                     │                                                             │
                     │                                                             │
                     │                                                             │
                     │                                                             │
                     └─────────────────────────────────────────────────────────────┘
                     decode result S
```

That approach would minimize `new Recognizer` elapsed, even if I noticed this partial latency is really low (few msecs) when a grammar is specified, 
whereas it increases to many tents of msecs if a grammar is NOT specified.

See also: https://github.com/alphacep/vosk-api/issues/553


---

[top](#) | [back](README.md) | [home](../README.md)


