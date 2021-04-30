# Transcript usage examples

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


## VoskJs Command line usage

```bash
$ node voskjs

usage:

    node voskjs --model=<model directory> --audio=<audio file name>

example:

    node voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2
```

## Standalone transcript program (one request at time)

[`simplest.js`](simplest.js) is a basic demo using VoskJs functionalities. 

The program transcript a wav file, using a specific language model. 
This is the brainless Vosk interface, perfect for embedded / standalone systems.

> The async architecture allows to process almost single requests (from single users).
> A dedicated thread is spawned for each transcript processing. 
> That means that the nodejs main thread is not 'saturated' by the CPU-intensive transcript processing.
> Latency performance will be optimal if your host has at least 2 cores.


## Transcript HTTP server 

[`httpServer.js`](httpServer.js) is a simple HTTP API server 
able to process concurrent/multi-user transcript requests in a specific language.

> A dedicated thread is spawned for each transcript processing request. 
> Latency performance will be optimal if your host has multiple cores.


To run the server: 

```bash
node httpServer
```


The server API endpoint client must call is very simple:

```bash
curl \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{ "speech": "../audio/2830-3980-0043.wav", "model": "vosk-model-en-us-aspire-0.2"} \
  http://localhost:3000/transcript
```

`com/` directory contains some utility bash scripts to test the client/server communication.
By example, if you want to test the JSON returned by the transcript endpoint: 

```bash
$ com/curlClientJSON.sh
{
    "speech": "../audio/2830-3980-0043.wav",
    "model": "vosk-model-en-us-aspire-0.2",
    "latency": 583,
    "result": [
        {
            "conf": 1,
            "end": 1.02,
            "start": 0.36,
            "word": "experience"
        },
        {
            "conf": 1,
            "end": 1.35,
            "start": 1.02,
            "word": "proves"
        },
        {
            "conf": 1,
            "end": 1.74,
            "start": 1.35,
            "word": "this"
        }
    ],
    "text": "experience proves this"
}

```

The HTTP server corresponding log:

```bash
$ node httpServer.js

1619687592873 Press Ctrl-C to shutdown
1619687592875 Model directory: ../models/vosk-model-small-en-us-0.15
1619687594074 init model latency: 1198ms
1619687594095 Server httpServer.js running at http://localhost:3000
1619687594095 Endpoint POST http://localhost:3000/transcript
1619687628186 request {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}
1619687628770 transcript latency: 583ms
1619687628770 response {"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2","latency":583,"result":[{"conf":1,"end":1.02,"start":0.36,"word":"experience"},{"conf":1,"end":1.35,"start":1.02,"word":"proves"},{"conf":1,"end":1.74,"start":1.35,"word":"this"}],"text":"experience proves this"}
```

---

[top](#) | [home](../README.md)

