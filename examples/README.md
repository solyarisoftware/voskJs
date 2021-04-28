# Transcript usage examples

## Standalone (one transcript request at time)

[`simplest.js`](simplest.js) is a basic demo using VoskJs functionalities. 

The program transcript a wav file, using a secific language model. 
This is the brainless Vosk interface, perfect for embedded / standalone systems.

> The asynch architecture allows to process almost single requests (from single users).
> A dedicated thread is spawned for each transcript processing. 
> That means that the the nodejs main thread is not 'saturated' by teh cpu-intensive transcript processing.
> Latency performance will be optimal if your host has at least 2 cores.


## Transcript HTTP server 

[`httpServer.js`](httpServer.js) is a simple HTTP API server 
able to process concurrent/multi-user transcript requests in a specific language.

> A dedicated thread is spawned for each transcript processing request. 
> Latency performance will be optimal if your host has multipe cores.


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

---

[top](#) | [home](../README.md)

