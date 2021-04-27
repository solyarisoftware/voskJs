
# TESTS

## Transcript using English language, large model

```
$ /usr/bin/time --verbose node voskjs  --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2

log level          : 0

LOG (VoskAPI:ReadDataFiles():model.cc:194) Decoding params beam=13 max-active=7000 lattice-beam=6
LOG (VoskAPI:ReadDataFiles():model.cc:197) Silence phones 1:2:3:4:5:6:7:8:9:10:11:12:13:14:15
LOG (VoskAPI:RemoveOrphanNodes():nnet-nnet.cc:948) Removed 1 orphan nodes.
LOG (VoskAPI:RemoveOrphanComponents():nnet-nnet.cc:847) Removing 2 orphan components.
LOG (VoskAPI:Collapse():nnet-utils.cc:1488) Added 1 components, removed 2
LOG (VoskAPI:CompileLooped():nnet-compile-looped.cc:345) Spent 0.00666904 seconds in looped compilation.
LOG (VoskAPI:ReadDataFiles():model.cc:221) Loading i-vector extractor from models/vosk-model-en-us-aspire-0.2/ivector/final.ie
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:183) Computing derived variables for iVector extractor
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:204) Done.
LOG (VoskAPI:ReadDataFiles():model.cc:246) Loading HCLG from models/vosk-model-en-us-aspire-0.2/graph/HCLG.fst
LOG (VoskAPI:ReadDataFiles():model.cc:265) Loading words from models/vosk-model-en-us-aspire-0.2/graph/words.txt
LOG (VoskAPI:ReadDataFiles():model.cc:273) Loading winfo models/vosk-model-en-us-aspire-0.2/graph/phones/word_boundary.int
LOG (VoskAPI:ReadDataFiles():model.cc:281) Loading CARPA model from models/vosk-model-en-us-aspire-0.2/rescore/G.carpa

init model elapsed : 2144ms
transcript elapsed : 424ms

{
  result: [
    { conf: 0.981375, end: 1.02, start: 0.33, word: 'experience' },
    { conf: 1, end: 1.349911, start: 1.02, word: 'proves' },
    { conf: 0.99702, end: 1.71, start: 1.35, word: 'this' }
  ],
  text: 'experience proves this'
}

	Command being timed: "node voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2"
	User time (seconds): 1.83
	System time (seconds): 1.39
	Percent of CPU this job got: 112%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:02.86
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 3267984
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 811718
	Voluntary context switches: 5147
	Involuntary context switches: 748
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 0

```

## Transcript using English language, small model

```
$ /usr/bin/time --verbose node voskjs  --audio=audio/2830-3980-0043.wav --model=models/vosk-model-small-en-us-0.15

log level          : 0

LOG (VoskAPI:ReadDataFiles():model.cc:194) Decoding params beam=10 max-active=3000 lattice-beam=2
LOG (VoskAPI:ReadDataFiles():model.cc:197) Silence phones 1:2:3:4:5:6:7:8:9:10
LOG (VoskAPI:RemoveOrphanNodes():nnet-nnet.cc:948) Removed 0 orphan nodes.
LOG (VoskAPI:RemoveOrphanComponents():nnet-nnet.cc:847) Removing 0 orphan components.
LOG (VoskAPI:CompileLooped():nnet-compile-looped.cc:345) Spent 0.024765 seconds in looped compilation.
LOG (VoskAPI:ReadDataFiles():model.cc:221) Loading i-vector extractor from models/vosk-model-small-en-us-0.15/ivector/final.ie
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:183) Computing derived variables for iVector extractor
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:204) Done.
LOG (VoskAPI:ReadDataFiles():model.cc:251) Loading HCL and G from models/vosk-model-small-en-us-0.15/graph/HCLr.fst models/vosk-model-small-en-us-0.15/graph/Gr.fst
LOG (VoskAPI:ReadDataFiles():model.cc:273) Loading winfo models/vosk-model-small-en-us-0.15/graph/phones/word_boundary.int

init model elapsed : 292ms
transcript elapsed : 550ms

{
  result: [
    { conf: 1, end: 1.02, start: 0.36, word: 'experience' },
    { conf: 1, end: 1.35, start: 1.02, word: 'proves' },
    { conf: 1, end: 1.74, start: 1.35, word: 'this' }
  ],
  text: 'experience proves this'
}

	Command being timed: "node voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-small-en-us-0.15"
	User time (seconds): 1.07
	System time (seconds): 0.12
	Percent of CPU this job got: 113%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:01.05
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 196232
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 42762
	Voluntary context switches: 1719
	Involuntary context switches: 467
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 0

```


## Comparison between Vosk and Mozilla DeepSpeech (latencies)

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

 > Vosk speeech recognition is ~238% faster than Deepspeech!
