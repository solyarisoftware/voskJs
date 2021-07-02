# Change log

- 1.2.8 
  - duplicated `partial` events are no more emitted
  - README.md updated

- 1.2.6 
  - voskjs new flags for pretty printing of streaming events: `tableevents`, `objectevents`

- 1.2.4
  - voskjs.js modified to better manage streaming events `partial`, `endOfSpeech` and `final`
  - voskjs.js: added `transcriptEventsFromFile` to manage streaming transcript with events. Just a draft
  - Now voskjs prints partial results, end of speech results and final result.
  - new audio file for test: audio/sentencesWithSilences.wav

- 1.1.5
  - docs update
  - updated to integrate vosk package 0.3.30 new functions (setAlternatives, setWords)

- 1.1.1
  - voskjshttp JSON response attribute *result* renamed *vosk*
  - lib/audioutils.js substitute lib/toPCM.js
  - httpServer.js renamed voskjshttp.js
  - documenattion updated

- 1.0.8
  - added flag `--no-threads` to `voskjshttp`
  - added voskjshttp docs to explain how to use it as a RHASSPY speech-to-text HTTP Remote Server 
  - documentation update

- 1.0.3
  - voskjs take sample rate as command line parameter
  - voskjshttp updated 
    - reply application/json or text/plain following request header attribute "Accept"
    - endpoint path /transcript can be configured 
    - added test scripts clientGETtext.sh and clientPOSTtext.sh
  - documentation update

- 1.0.2
  - added versions info in voskjs and voskjshttp
  - clientGET*.sh scripts updated using a full path name for the WAV file
  - httpserver check contet-type 

- 1.0.0
  - functions loadModule, transcriptFromFile, transcriptFromBuffer now returns simple values instead of objects containing latency attribute
  - added module lib/chronos.js to manage latencies 
  - added createRecognizer function prepared to manager MaxAlternatives
  - added flag --debug to voskjs cli

- 0.5.2
  - lib/toPCM updated
  - Documentaion rework

- 0.5.1
  - httpServer.js is now renamed voskjshttp.js. It accepts GET and POST endpoints
  - voskjshttp now reply to an HTTP POST request receiving the speech WAV 
    file as binary data attached in the HTTP request:
    ```
     curl -X POST 'http:localhost:3000/transcript' \
      --header "Content-Type: audio/wav" \
      --data-binary "@speech.wav"
    ```

- 0.4.0
  - httpServer interface changed. Now accepting HTTP GET requests and query string arguments.

- 0.3.14
  - added latency tests (with/without grammars)
  - added function `transcriptFromBuffer` that transcripts audio as buffer instead of as a WAV file
  - added `lib/toPCM.js` module function to manage ffmpeg input/output Buffers, 
    through stdin/stdout, avoiding disk I/O

- 0.3.11
  - added some tests to verify ffmpeg transcoding times 
    (using stdout pipe / without producing wav file)

- 0.3.8
  - Integrate CLI command `voskjs` with grammar argument 
  - global installation of the package allow to run `voskjs` cli program
  - socketio server program example

- 0.3.6
  - delivered @solyarisoftware/voskjs (added index.js)
  - httpServer now accepts grammar attribute in client API calls 
  - added test program tests/sequentialRequests.js
  - function `transcript` can be called with alias `recognize`
  - function `transcript` now accept options argument, allowing to manage Vosk grammar format.
  - documenation improved (README, examples/README, tests/README) 

- 0.2.11
  - added com/abtest.sh, apache bench httpServer stress test script
  - httpServer improved: 
    - better validation of body request 
    - accept optionally client request id as attribute in the request body
    - takes model, port and debug attributes as command line args.
  - documenation improved (README, examples/README, tests/README) 

- 0.2.1
  - added function logLevel
  - httpServer error responses improvements

- 0.2.0
  - function initModel is renamed loadModel
  - function loadModel and Transcript  return an object containing also the processing latency
  - httpServer reviewed. The transcript endpoint return a different JSON data structure, containing latency time.

- 0.1.0 
  Added a simple HTTP sever

- 0.0.15 
  Added tests directory, containing some stress tests results

- 0.0.14 
  Transcript function updated to integrate Vosk version 0.3.25 (`npm install vosk@latest`), 
  where the function `rec.acceptWaveformAsync` now run on a separated external thread!

---

[top](#) | [home](README.md)

