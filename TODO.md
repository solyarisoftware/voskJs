# 🤔 To do / How to contribute

## 🤔 To do

- To speedup latencies, rethink transcript interface, maybe with an initialization phases, 
  including Model and Recognizer(s) object creation.
- Implement interfaces for all [Vosk-api functions](https://github.com/alphacep/vosk-api/blob/master/nodejs/index.js)
- Deepen grammar usage with examples
- add to voskjs sampling rate parameter
- Vosk-API errors catching
- httpserver 
  - Review stress and performances tests (especially for the HTTP server)
  - HTTP POST management: set mandatory audio format mime type in the header request (`--header "Content-Type: audio/wav"`)
  - HTTP POST management: audio-transcoding using `toPcm()` 
    if input speech files are not specified as wav in header request (`--header "Content-Type: audio/webm"`)
    see https://cloud.ibm.com/docs/speech-to-text?topic=speech-to-text-audio-formats#audio-formats-list


## ✋ How to contribute

Any contribute is welcome. 
- [Discussions](https://github.com/solyarisoftware/voskJs/discussions). 
  Please open a new discussion (a publich chat on github) for any specific open topic, 
  for a clarification, change request proposals, etc.
- [Issues](https://github.com/solyarisoftware/voskJs/issues) Please submit issues for bugs, etc
- [e-mail](giorgio.robino@gmail.com) You can contact me privately, via email

---

[top](#)
