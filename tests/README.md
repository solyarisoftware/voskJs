# TESTS

- [Transcript using English language, large model](#transcript-using-english-language-large-model)
- [Transcript using English language, small model](#transcript-using-english-language-small-model)
- [Comparison between Vosk and Mozilla DeepSpeech (latencies)](#comparison-between-vosk-and-mozilla-deepspeech-latencies)
- [Multithread stress test (10 requests in parallel)](#multithread-stress-test-10-requests-in-parallel)
- [HTTP Server benchmark test](#http-server-benchmark-test)
- [Latency tests](#latency-tests) 


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
 /usr/bin/time --verbose node voskjs  --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2
```
```

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
/usr/bin/time --verbose node voskjs  --audio=audio/2830-3980-0043.wav --model=models/vosk-model-small-en-us-0.15
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
 node deepSpeechTranscriptNative ./models/deepspeech-0.9.3-models.pbmm ./models/deepspeech-0.9.3-models.scorer ./audio/2830-3980-0043.wav 
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


## Multithread stress test (10 requests in parallel)

```bash
/usr/bin/time -f "%e" pidstat 1 -u -e node parallelRequests 10
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

To benchmark `voskjshttp` I used Apache Bench (ab) in the script `abtest.sh`. 

WARNING:
Unfortunately when running the test script, that submit 10 requestes in parallel for a while,
the voskjshttp crashes (node versions >= 14). 

Opened issue: https://github.com/solyarisoftware/voskJs/issues/3 
has workaround: https://github.com/alphacep/vosk-api/issues/516#issuecomment-833462121


### 1. Run voskjshttp

```bash
node --model=../models/vosk-model-en-us-aspire-0.2 > voskjshttp.log
```
```

#
# Fatal error in , line 0
# Check failed: result.second.
#
#
#
#FailureMessage Object: 0x7ffe935bbbc0
 1: 0xb7db41  [node]
 2: 0x1c15474 V8_Fatal(char const*, ...) [node]
 3: 0x100c201 v8::internal::GlobalBackingStoreRegistry::Register(std::shared_ptr<v8::internal::BackingStore>) [node]
 4: 0xd23818 v8::ArrayBuffer::GetBackingStore() [node]
 5: 0xacb640 napi_get_typedarray_info [node]
 6: 0x7f70c84600ff  [/home/giorgio/voskjs/node_modules/ref-napi/prebuilds/linux-x64/node.napi.node]
 7: 0x7f70c84608a8  [/home/giorgio/voskjs/node_modules/ref-napi/prebuilds/linux-x64/node.napi.node]
 8: 0x7f70c8462591  [/home/giorgio/voskjs/node_modules/ref-napi/prebuilds/linux-x64/node.napi.node]
 9: 0x7f70c8468d6b Napi::details::CallbackData<void (*)(Napi::CallbackInfo const&), void>::Wrapper(napi_env__*, napi_callback_info__*) [/home/giorgio/voskjs/node_modules/ref-napi/prebuilds/linux-x64/node.napi.node]
10: 0xac220f  [node]
11: 0xd5f70b  [node]
12: 0xd60bac  [node]
13: 0xd61226 v8::internal::Builtin_HandleApiCall(int, unsigned long*, v8::internal::Isolate*) [node]
14: 0x160c579  [node]
Illegal instruction (core dumped)

```

### 2. run abtest.sh

Test the server, using a GET request

```bash
abtest.sh 
```
```
test voskjshttp using apache bench
  10 concurrent clients
  200 requests to run

full ab command
  ab -c 10 -n 200 -l -k -r 'http://localhost:3000/transcript?speech=..%2Faudio%2F2830-3980-0043.wav'

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

Document Path:          /transcript?speech=..%2Faudio%2F2830-3980-0043.wav
Document Length:        Variable

Concurrency Level:      10
Time taken for tests:   26.291 seconds
Complete requests:      200
Failed requests:        189
   (Connect: 0, Receive: 126, Length: 0, Exceptions: 63)
Keep-Alive requests:    0
Total transferred:      36747 bytes
Total body sent:        24920
HTML transferred:       28080 bytes
Requests per second:    7.61 [#/sec] (mean)
Time per request:       1314.573 [ms] (mean)
Time per request:       131.457 [ms] (mean, across all concurrent requests)
Transfer rate:          1.36 [Kbytes/sec] received
                        0.93 kb/s sent
                        2.29 kb/s total

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.1      0       1
Processing:     0 1271 1533.0      0    6502
Waiting:        0 1524 1579.9   2012    4269
Total:          0 1271 1533.1      0    6502

Percentage of the requests served within a certain time (ms)
  50%      0
  66%   2340
  75%   2548
  80%   2629
  90%   3066
  95%   3817
  98%   5093
  99%   6501
 100%   6502 (longest request)
```

## Latency tests 

Do you want to measure how fast Vosk speech-to-text.

Program [`transcodeToPCMAsyncOneBuffer.js`](transcodeToPCMAsyncOneBuffer.js) 
does a speech to text transcript, using model `vosk-model-small-en-us-0.15` 
of a 3 words sentences 'experience proves this', 
starting from an OPUS compressed file `audio/2830-3980-0043.wav.webm`
that is transcoded to a PCM buffer (using ffmpeg).

### Without a grammar

Using the Vosk model without a grammar, the 'net' latency, measuring elapsed time, 
using 'multithreading' `acceptWavefromAsync()` Vosk function, 
you get a value of **513 milliseconds**. Not bad!

```
node transcodeToPCMAsyncOneBuffer.js 
```
```
model directory         : ../models/vosk-model-small-en-us-0.15
speech file name        : ../audio/2830-3980-0043.wav.webm
grammar                 : zero,one,two,three,four,five,six,seven,eight,nine,alfa for a,bravo for b,charlie for c,delta for d,echo for e,foxtrot for f,golf for g,hotel for h,india for i,juliet for j,kilo for k,lima for l,mike for m,november for n,oscar for o,papa for p,quebec for q,romeo for r,sierra for s,tango for t,uniform for u,victor for v,whiskey for w,x ray for x,yankee for y,zulu for z,experience proves this,why should one hold on the way,your power is sufficient i said,oh one two three four five six seven eight nine zero,[unk]
ffmpeg command          : ffmpeg -loglevel quiet -i ../audio/2830-3980-0043.wav.webm -ar 16000 -ac 1 -f s16le -bufsize 4000 pipe:1

final transcript        :
{
  result: [
    { conf: 1, end: 1.02, start: 0.36, word: 'experience' },
    { conf: 1, end: 1.35, start: 1.02, word: 'proves' },
    { conf: 1, end: 1.74, start: 1.35, word: 'this' }
  ],
  text: 'experience proves this'
}

LATENCIES:
load model              : 295ms
recognizer              : 58ms
ffmpeg to PCM           : 51ms
acceptWavefromAsync     : 513ms
laten. from ffmpeg start: 564ms
```

### With a grammar

Using the Vosk model with a 'medium size' grammar, the 'net' latency, measuring elapsed time, 
using 'multithreading' `acceptWavefromAsync()` Vosk function, 
slow down to a value of **56 milliseconds**. An order of magnitude smaller value!


```
node transcodeToPCMAsyncOneBuffer.js 
```
```
model directory         : ../models/vosk-model-small-en-us-0.15
speech file name        : ../audio/2830-3980-0043.wav.webm
grammar                 : zero,one,two,three,four,five,six,seven,eight,nine,alfa for a,bravo for b,charlie for c,delta for d,echo for e,foxtrot for f,golf for g,hotel for h,india for i,juliet for j,kilo for k,lima for l,mike for m,november for n,oscar for o,papa for p,quebec for q,romeo for r,sierra for s,tango for t,uniform for u,victor for v,whiskey for w,x ray for x,yankee for y,zulu for z,experience proves this,why should one hold on the way,your power is sufficient i said,oh one two three four five six seven eight nine zero,[unk]
ffmpeg command          : ffmpeg -loglevel quiet -i ../audio/2830-3980-0043.wav.webm -ar 16000 -ac 1 -f s16le -bufsize 4000 pipe:1

final transcript        :
{
  result: [
    { conf: 1, end: 1.02, start: 0.36, word: 'experience' },
    { conf: 1, end: 1.35, start: 1.02, word: 'proves' },
    { conf: 1, end: 1.74, start: 1.35, word: 'this' }
  ],
  text: 'experience proves this'
}

LATENCIES:
load model              : 288ms
recognizer              : 4ms
ffmpeg to PCM           : 54ms
acceptWavefromAsync     : 56ms
laten. from ffmpeg start: 110ms
```


## 🤔 Notes

1. Latency

   Vosk ASR is fast! Run-time latency for file `./audio/2830-3980-0043.wav`
   using English large model, is just 428 ms on my laptop. 

   Weirdly the English small model performances are  abit worst, with 598ms. Not clear to me. 

2. Comparison between Vosk and Mozilla DeepSpeech (latencies)

   For the comparison I used [DeepSpeechJs](https://github.com/solyarisoftware/DeepSpeechJs), 
   my simple nodejs interface to Deepspeech. See results [here](tests/README.md).

See also: 
- [What's the Vosk CPU usage at run-time?](https://github.com/alphacep/vosk-api/issues/498)
- [How to set-up a Vosk multi-threads server architecture in NodeJs](https://github.com/alphacep/vosk-api/issues/502) 
- [Stateful & low latency ASR architecture](https://github.com/alphacep/vosk-api/issues/553)


---

[top](#) | [home](../README.md)
