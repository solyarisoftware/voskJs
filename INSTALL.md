# 🛍 Install 

## 1. Install Vosk engine and this nodejs module 

- Install vosk-api engine
  ```bash
  pip3 install vosk 
  ```
  See also: https://alphacephei.com/vosk/install

- Install this module, as global package if you want to use CLI command `voskjs` 
  ```bash
  npm install -g @solyarisoftware/voskjs
  ```


## 2. Install/Download Vosk models

```bash
mkdir your/path/models && cd models

# English large model
wget https://alphacephei.com/vosk/models/vosk-model-en-us-aspire-0.2.zip
unzip vosk-model-en-us-aspire-0.2.zip

# English small model
wget http://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip

# Italian model model
wget https://alphacephei.com/vosk/models/vosk-model-small-it-0.4.zip
unzip vosk-model-small-it-0.4.zip
```

More about available Vosk models here: https://alphacephei.com/vosk/models

## 3. Demo audio files

Directory [`audio`](audio/) contains some English language speech audio files, 
coming from a Mozilla DeepSpeech repo.
Source: [Mozilla DeepSpeech audio samples](https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/audio-0.9.3.tar.gz)
These files are used for some tests and comparisons.

---

[top](#)
