# Change log

- 0.3.13
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

