# TESTS

- [Transcript using English language, large model](#Transcript-using-English-language--large-model)
- [Transcript using English language, small model](#Transcript-using-English-language--small-model)
- [Comparison between Vosk and Mozilla DeepSpeech (latencies)](#Comparison-between-Vosk-and-Mozilla-DeepSpeech--latencies-)
- [Multithread stress test (single request)](#Multithread-stress-test--single-request-)
- [Multithread stress test (10 requests in parallel)](#Multithread-stress-test--10-requests-in-parallel-)
- [HTTP Server benchmark test](#HTTP-Server-benchmark-test)

## My hardware / host configuration

All tests run on my laptop:

- Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz
- 8 cores
- Ubuntu desktop Ubuntu 20.04
- node v16.0.0

```bash
cat /proc/cpuinfo | grep 'model name' | uniq
model name  : Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz
```

```bash
inxi -S -C -M
System:    Host: giorgio-HP-Laptop-17-by1xxx Kernel: 5.8.0-50-generic x86_64 bits: 64 Desktop: Gnome 3.36.7 
           Distro: Ubuntu 20.04.2 LTS (Focal Fossa) 
Machine:   Type: Laptop System: HP product: HP Laptop 17-by1xxx v: Type1ProductConfigId serial: <superuser/root required> 
           Mobo: HP model: 8531 v: 17.16 serial: <superuser/root required> UEFI: Insyde v: F.32 date: 12/14/2018 
CPU:       Topology: Quad Core model: Intel Core i7-8565U bits: 64 type: MT MCP L2 cache: 8192 KiB 
           Speed: 600 MHz min/max: 400/4600 MHz Core speeds (MHz): 1: 600 2: 600 3: 600 4: 600 5: 600 6: 600 7: 600 8: 600 
```

My laptop has weird cores usage I claimed here:

- https://stackoverflow.com/questions/67182001/running-multiple-nodejs-worker-threads-why-of-such-a-large-overhead-latency
- https://stackoverflow.com/questions/67211241/why-program-execution-time-differs-running-the-same-program-multiple-times


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

```bash
$ /usr/bin/time --verbose node voskjs  --audio=audio/2830-3980-0043.wav --model=models/vosk-model-small-en-us-0.15
```
```
load model elapsed : 292ms
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
 ```
 ```
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


## Multithread stress test (single thread)

```bash
$ /usr/bin/time -f "%e" pidstat 1 -u -e node stressTest 1
```
```
Linux 5.8.0-50-generic (giorgio-HP-Laptop-17-by1xxx) 	29/04/2021 	_x86_64_	(8 CPU)

CPU cores in this host : 8
requests to be spawned : 1

model directory        : ../models/vosk-model-en-us-aspire-0.2
speech file name       : ../audio/2830-3980-0043.wav


17:45:21      UID       PID    %usr %system  %guest   %wait    %CPU   CPU  Command
17:45:22     1000    346431   53,00   79,00    0,00    0,00  132,00     0  node
17:45:23     1000    346431   86,00   14,00    0,00    0,00  100,00     0  node
load model latency     : 2119ms

transcript latency     : 417ms

Average:     1000    346431   69,50   46,50    0,00    0,00  116,00     -  node
2.89
```

## Multithread stress test (10 requests in parallel)

```bash
$ /usr/bin/time -f "%e" pidstat 1 -u -e node stressTest 10
```
```
Linux 5.8.0-50-generic (giorgio-HP-Laptop-17-by1xxx) 	29/04/2021 	_x86_64_	(8 CPU)

CPU cores in this host : 8
warning: number of requested tasks (10) is higher than number of available cores (8)
requests to be spawned : 10

model directory        : ../models/vosk-model-en-us-aspire-0.2
speech file name       : ../audio/2830-3980-0043.wav


17:45:32      UID       PID    %usr %system  %guest   %wait    %CPU   CPU  Command
17:45:33     1000    346959   48,00   83,00    0,00    0,00  131,00     6  node
17:45:34     1000    346959   82,00   18,00    0,00    0,00  100,00     6  node
load model latency     : 2117ms

17:45:35     1000    346959  248,00   34,00    0,00    0,00  282,00     3  node
transcript latency     : 1630ms
17:45:36     1000    346959  365,00    4,00    0,00    0,00  369,00     3  node
transcript latency     : 1738ms
transcript latency     : 2451ms
transcript latency     : 1830ms
transcript latency     : 1920ms
transcript latency     : 2202ms
transcript latency     : 1998ms
transcript latency     : 2084ms
transcript latency     : 2294ms
transcript latency     : 2501ms
17:45:37     1000    346959   88,00   13,00    0,00    0,00  101,00     3  node

Average:     1000    346959  166,20   30,40    0,00    0,00  196,60     -  node
5.03
```

## HTTP Server benchmark test

To benchmark `httpServer` I used Apache Bench (ab) in the script `abtest.sh`. 

### 1. Run httpServer
```
$ node httpServer --model=../models/vosk-model-small-en-us-0.15 --debug=2
1619941467566 Model path: ../models/vosk-model-small-en-us-0.15
1619941467567 Model name: vosk-model-small-en-us-0.15
1619941467568 HTTP server port: 3000
1619941467568 internal debug log: true
1619941467568 Vosk engine log level: 2
1619941467568 loading Vosk engine model: vosk-model-small-en-us-0.15 ...
LOG (VoskAPI:ReadDataFiles():model.cc:194) Decoding params beam=10 max-active=3000 lattice-beam=2
LOG (VoskAPI:ReadDataFiles():model.cc:197) Silence phones 1:2:3:4:5:6:7:8:9:10
LOG (VoskAPI:RemoveOrphanNodes():nnet-nnet.cc:948) Removed 0 orphan nodes.
LOG (VoskAPI:RemoveOrphanComponents():nnet-nnet.cc:847) Removing 0 orphan components.
LOG (VoskAPI:CompileLooped():nnet-compile-looped.cc:345) Spent 0.0242438 seconds in looped compilation.
LOG (VoskAPI:ReadDataFiles():model.cc:221) Loading i-vector extractor from ../models/vosk-model-small-en-us-0.15/ivector/final.ie
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:183) Computing derived variables for iVector extractor
LOG (VoskAPI:ComputeDerivedVars():ivector-extractor.cc:204) Done.
LOG (VoskAPI:ReadDataFiles():model.cc:251) Loading HCL and G from ../models/vosk-model-small-en-us-0.15/graph/HCLr.fst ../models/vosk-model-small-en-us-0.15/graph/Gr.fst
LOG (VoskAPI:ReadDataFiles():model.cc:273) Loading winfo ../models/vosk-model-small-en-us-0.15/graph/phones/word_boundary.int
1619941467859 loaded Vosk engine model in 291 msecs
1619941467861 Press Ctrl-C to shutdown
1619941467861 Server httpServer.js running at http://localhost:3000
1619941467862 Endpoint http://localhost:3000/transcript


1619941477998 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941477999 debug active requests 1
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.69913 and iVector length was 4.49303
1619941478571 debug active requests 0
1619941478571 response 1619941477998 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941477998,"latency":572,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941478573 debug latency 1619941477998 572ms
1619941478576 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941478576 debug active requests 1
1619941478633 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941478633 debug active requests 2
1619941478691 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941478691 debug active requests 3
1619941478748 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941478748 debug active requests 4
1619941478805 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941478805 debug active requests 5
1619941478863 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941478863 debug active requests 6
1619941478922 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941478922 debug active requests 7
1619941478979 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941478979 debug active requests 8
1619941479037 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941479037 debug active requests 9
1619941479095 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941479095 debug active requests 10
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.70248 and iVector length was 4.49282
1619941481134 debug active requests 9
1619941481134 response 1619941478576 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941478576,"latency":2557,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941481135 debug latency 1619941478576 2557ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.71119 and iVector length was 4.49304
1619941481196 debug active requests 8
1619941481196 response 1619941478691 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941478691,"latency":2505,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941481196 debug latency 1619941478691 2505ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.69337 and iVector length was 4.49338
1619941481240 debug active requests 7
1619941481240 response 1619941478863 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941478863,"latency":2377,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941481241 debug latency 1619941478863 2377ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.67702 and iVector length was 4.48864
1619941481287 debug active requests 6
1619941481287 response 1619941478633 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941478633,"latency":2654,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941481287 debug latency 1619941478633 2654ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.69572 and iVector length was 4.49353
1619941481331 debug active requests 5
1619941481331 response 1619941478748 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941478748,"latency":2583,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941481331 debug latency 1619941478748 2583ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.70979 and iVector length was 4.4914
1619941481375 debug active requests 4
1619941481375 response 1619941479037 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941479037,"latency":2338,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941481375 debug latency 1619941479037 2338ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.70511 and iVector length was 4.49527
1619941481421 debug active requests 3
1619941481421 response 1619941478922 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941478922,"latency":2499,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941481421 debug latency 1619941478922 2499ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.70199 and iVector length was 4.4937
1619941481468 debug active requests 2
1619941481468 response 1619941478805 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941478805,"latency":2662,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941481468 debug latency 1619941478805 2662ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.68323 and iVector length was 4.49007
1619941481514 debug active requests 1
1619941481514 response 1619941478979 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941478979,"latency":2535,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941481514 debug latency 1619941478979 2535ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.69129 and iVector length was 4.48939
1619941481560 debug active requests 0
1619941481560 response 1619941479095 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941479095,"latency":2465,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941481560 debug latency 1619941479095 2465ms
1619941481563 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941481563 debug active requests 1
1619941481624 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941481624 debug active requests 2
1619941481681 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941481681 debug active requests 3
1619941481738 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941481738 debug active requests 4
1619941481796 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941481796 debug active requests 5
1619941481853 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941481853 debug active requests 6
1619941481914 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941481914 debug active requests 7
1619941481971 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941481971 debug active requests 8
1619941482028 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941482028 debug active requests 9
1619941482087 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941482087 debug active requests 10
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.7252 and iVector length was 4.49325
1619941484167 debug active requests 9
1619941484167 response 1619941481563 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941481563,"latency":2604,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941484170 debug latency 1619941481563 2604ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.69045 and iVector length was 4.48801
1619941484275 debug active requests 8
1619941484275 response 1619941481624 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941481624,"latency":2650,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941484275 debug latency 1619941481624 2650ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.68062 and iVector length was 4.49234
1619941484378 debug active requests 7
1619941484378 response 1619941481738 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941481738,"latency":2640,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941484379 debug latency 1619941481738 2640ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.68775 and iVector length was 4.49467
1619941484452 debug active requests 6
1619941484452 response 1619941481796 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941481796,"latency":2656,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941484452 debug latency 1619941481796 2656ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.71043 and iVector length was 4.49018
1619941484523 debug active requests 5
1619941484523 response 1619941481681 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941481681,"latency":2842,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941484524 debug latency 1619941481681 2842ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.68131 and iVector length was 4.48933
1619941484595 debug active requests 4
1619941484595 response 1619941481853 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941481853,"latency":2742,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941484596 debug latency 1619941481853 2742ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.70615 and iVector length was 4.49298
1619941484658 debug active requests 3
1619941484659 response 1619941481971 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941481971,"latency":2687,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941484659 debug latency 1619941481971 2687ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.68045 and iVector length was 4.48913
1619941484712 debug active requests 2
1619941484713 response 1619941481914 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941481914,"latency":2798,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941484713 debug latency 1619941481914 2798ms
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.69443 and iVector length was 4.49153
1619941484764 debug active requests 1
1619941484764 response 1619941482028 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941482028,"latency":2736,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941484764 debug latency 1619941482028 2736ms
1619941484772 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

...
...
...

1619941534419 debug active requests 9
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.7054 and iVector length was 4.49389
1619941534786 debug active requests 8
1619941534786 response 1619941531140 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941531140,"latency":3646,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941534787 debug latency 1619941531140 3646ms
1619941534788 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941534788 debug active requests 9
1619941534965 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}

1619941534965 debug active requests 10
VLOG[2] (VoskAPI:AccStats():sausages.cc:197) L = 0
VLOG[2] (VoskAPI:MbrDecode():sausages.cc:98) Iter = 0, delta-Q = 0
VLOG[2] (VoskAPI:PrintDiagnostics():online-ivector-feature.cc:369) By the end of the utterance, objf change/frame from estimating iVector (vs. default) was 9.68962 and iVector length was 4.49117
1619941535254 debug active requests 9
1619941535255 response 1619941531281 {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","requestId":1619941531281,"latency":3973,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
1619941535256 debug latency 1619941531281 3973ms


#
# Fatal error in , line 0
# Check failed: result.second.
#
#
#
#FailureMessage Object: 0x7fff4e7883b0
 1: 0xb7db41  [node]
 2: 0x1c15474 V8_Fatal(char const*, ...) [node]
 3: 0x100c201 v8::internal::GlobalBackingStoreRegistry::Register(std::shared_ptr<v8::internal::BackingStore>) [node]
 4: 0xd23818 v8::ArrayBuffer::GetBackingStore() [node]
 5: 0xacb640 napi_get_typedarray_info [node]
 6: 0x7f2039dee0ff  [/home/giorgio/voskjs/node_modules/ref-napi/prebuilds/linux-x64/node.napi.node]
 7: 0x7f2039dee8a8  [/home/giorgio/voskjs/node_modules/ref-napi/prebuilds/linux-x64/node.napi.node]
 8: 0x7f2039df0591  [/home/giorgio/voskjs/node_modules/ref-napi/prebuilds/linux-x64/node.napi.node]
 9: 0x7f2039df6d6b Napi::details::CallbackData<void (*)(Napi::CallbackInfo const&), void>::Wrapper(napi_env__*, napi_callback_info__*) [/home/giorgio/voskjs/node_modules/ref-napi/prebuilds/linux-x64/node.napi.node]
10: 0xac220f  [node]
11: 0x15a8f0c  [node]
Illegal instruction (core dumped)
```

### 2. run abtest.sh

```
$ tests/abtest.sh

test httpServer using apache bench
  10 concurrent clients
  200 requests to run

full ab command
  ab -p /home/giorgio/voskjs/tests/body.json -T application/json -H 'Content-Type: application/json' -c 10 -n 200 -l -k -r http://localhost:3000/transcript

This is ApacheBench, Version 2.3 <$Revision: 1843412 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 100 requests
Completed 200 requests
Finished 200 requests


Server Software:
Server Hostname:        localhost
Server Port:            3000

Document Path:          /transcript
Document Length:        Variable

Concurrency Level:      10
Time taken for tests:   57.533 seconds
Complete requests:      200
Failed requests:        108
   (Connect: 0, Receive: 72, Length: 0, Exceptions: 36)
Keep-Alive requests:    0
Total transferred:      58511 bytes
Total body sent:        41160
HTML transferred:       43745 bytes
Requests per second:    3.48 [#/sec] (mean)
Time per request:       2876.636 [ms] (mean)
Time per request:       287.664 [ms] (mean, across all concurrent requests)
Transfer rate:          0.99 [Kbytes/sec] received
                        0.70 kb/s sent
                        1.69 kb/s total

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       0
Processing:     0 2850 1837.6   3713    5046
Waiting:        0 2739 1795.1   3652    4930
Total:          0 2850 1837.7   3713    5046

Percentage of the requests served within a certain time (ms)
  50%   3713
  66%   4254
  75%   4334
  80%   4389
  90%   4501
  95%   4645
  98%   4716
  99%   4817
 100%   5046 (longest request)
```

---

[top](#) | [home](../README.md)
