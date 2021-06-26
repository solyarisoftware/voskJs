# VoskJs Usage Examples

- [`voskjs` Command line utility](#voskjs-command-line-utility)
- [Simple program for a sentence-based speech-to-text](#simple-program-for-a-sentence-based-speech-to-text)
- [Using Vosk grammars](grammars.md)
- [`voskjshttp` and other server examples](servers.md)

## `voskjs` Command line utility

If you install install this module as global package: 
```bash
npm install -g @solyarisoftware/voskjs
```

Afterward you can enjoy voskjs command line utility program:

```bash
voskjs
```
```
voskjs is a CLI utility to test Vosk-api features
package @solyarisoftware/voskjs version 1.1.3, Vosk-api version 0.3.30

Usage

  voskjs \
    --model=<model directory> \
    --audio=<audio file name> \
    [--grammar=<list of comma-separated words or sentences>] \
    [--samplerate=<Number, usually 16000 or 8000>] \
    [--alternatives=<number of max alternatives in text result>] \
    [--textonly] \
    [--debug=<Vosk debug level>]

Examples

  1. Recognize a speech file using a specific model directory:

     voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2

  2. Recognize a speech file setting a grammar (with a dynamic graph model) and a number of alternative:

     voskjs \
       --audio=audio/2830-3980-0043.wav \
       --model=models/vosk-model-small-en-us-0.15 \
       --grammar="experience proves this, bla bla bla"
       --alternatives=3
```


## Simple program for a sentence-based speech-to-text   

[`simple.js`](simple.js) is a basic demo using VoskJs functionalities. 

The program transcript (recognize, in Vosk parlance) a speech in a wav file, 
using a specified language model. 
This is the brainless Vosk interface, perfect for embedded / standalone systems, 
but also as entry point for any custom server applications.

NOTE
With trascript function default settings, 
a dedicated thread is spawned for each transcript processing. 
That means that the nodejs main thread is not 'saturated' by the CPU-intensive transcript processing.
Latency performance will be optimal if your host has at least 2 cores.

```bash
node simple
```
```
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

---

[top](#) | [home](../README.md)

