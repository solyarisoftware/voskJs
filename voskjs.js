#!/usr/bin/env node

/**
 * @module voskjs 
 *
 * @public
 * @function logLevel
 * @function loadModel
 * @function transcript
 * @function freeModel
 *
-* @see VoskAPI https://github.com/alphacep/vosk-api/blob/master/nodejs/index.js
 */
const vosk = require('vosk')

const fs = require('fs')
const { Readable } = require('stream')
const wav = require('wav')

const { getArgs } = require('./lib/getArgs')

/**
 * @constant
 */
const SAMPLE_RATE = 16000

/**
 */ 

/**
 * @function logLevel
 * @public
 * Set log level for Vosk/Kaldi log messages
 *
 * @param {number} level   The higher, the more verbose. 0 for infos and errors. Less than 0 for silence. 
 */
function logLevel(level=0) {

  // set vosk log level
  vosk.setLogLevel(level)

}  


/**
 * @function loadModel 
 * Create a run time model from the specified directory 
 *
 * @async
 * @public
 *
 * @param {String}       modelDirectory directory name of the Vosk model
 *
 * @typedef ModelObject
 * @property {VoskModel} model          run time model object returned by Vosk engine.
 * @property {Number}    latency        elpased time in msecs
 *
 * @return {promise<ModelObject>}
 *
 */ 
function loadModel(modelDirectory) {

  return new Promise( (resolve, reject) => {

    const latencyStart = new Date()
    
    // check if model directory exists, async
    fs.access(modelDirectory, (err) => {
      if (err) 
        return reject(`${err}: file ${modelDirectory} not found.`)
    })
    
    // create new run time model from the specified directory 
    const model = new vosk.Model(modelDirectory)

    const latency = new Date() - latencyStart

    return resolve( {model, latency} )
  })

}  


/**
 * @function transcriptFromFile
 * @alias transcript
 * @alias recognize
 * speech recognition into a text, from an audio file, given a specified Vosk model
 * @public
 * @async
 *
 * @typedef VoskRecognizerArgsObject
 * @property {Boolean}                 multiThreads if true, an external (Vosk engine) thread is spawned on the fly
 *                                                  that need in server (concurrent requests) architecture.
 * @property {Number}                  sampleRate   Default value: 16000
 * @property {String[]}                grammar      array of words, or sentences
 *
 * @typedef RecognizeObject
 *   @property {VoskResultObject}      result       transcript object returned by Vosk engine.
 *   @property {Number}                latency      transcript elpased time in msecs
 *
 * @param {String}                     fileName     the name of speech file, in WAV format
 * @param {ModelObject}                model        the Vosk model returned by InitModel()
 * @param {VoskRecognizerArgsObject}   [options]    Vosk Recognizer arguments setting. Optional. 
 *
 * @return {Promise<RecognizeObject>} 
 *
 */ 
async function transcriptFromFile(fileName, model, { multiThreads=true, sampleRate=SAMPLE_RATE, grammar=null } = {}) {

  return new Promise( (resolve, reject) => {

    const latencyStart = new Date()

    // validate audiofile existence, async
    fs.access(fileName, (err) => {
      if (err) 
        return reject(`${err}: file ${fileName} not found.`)
    })

    // if a grammar is specified, pass it to the Vosk Recognizer
    const voskRecognizerArgs = grammar ? 
      {model, sampleRate, grammar} :
      {model, sampleRate}

    // create Vosk recognizer
    const recognizer = new vosk.Recognizer(voskRecognizerArgs)

    const wfStream = fs.createReadStream(fileName, {'highWaterMark': 4096})
    const wfReader = new wav.Reader()
    
    wfStream.pipe(wfReader)
    
    const pcmChunks = new Readable().wrap(wfReader)

    wfReader.on('format', async ( { audioFormat, sampleRate, channels } ) => {
        
      if (audioFormat != 1 || channels != 1)
        return reject(`${fileName}: audio file (sample rate: ${sampleRate}) must be WAV format mono PCM.`)


      for await (const data of pcmChunks) {

        //
        // WARNING
        // From vosk version 0.3.25
        // the acceptWaveformAsync function runs in a dedicated thread.
        // That wold improve performances in case of cocurrent requests 
        // from the caller (server) program  
        //
        // Previous vosk version 0.3.25
        // const end_of_speech = recognizer.acceptWaveform(data)
        //
        const end_of_speech = multiThreads ? 
          await recognizer.acceptWaveformAsync(data) : 
          recognizer.acceptWaveform(data)

        if (end_of_speech) {
          console.log(recognizer.result())
        }
      
      }

      // copy final Vosk engine result object
      const result = {...recognizer.finalResult(recognizer)} 

      recognizer.free()
      
      const latency = new Date() - latencyStart

      return resolve( {result, latency} )

    })
  })

}


/**
 * @function transcriptFromBuffer
 * @alias transcript
 * @alias recognize
 * speech recognition into a text, from an audio file, given a specified Vosk model
 * @public
 * @async
 *
 * @typedef VoskRecognizerArgsObject
 * @property {Boolean}                 multiThreads if true, an external (Vosk engine) thread is spawned on the fly
 *                                                  that need in server (concurrent requests) architecture.
 * @property {Number}                  sampleRate   Default value: 16000
 * @property {String[]}                grammar      array of words, or sentences
 *
 * @typedef RecognizeObject
 *   @property {VoskResultObject}      result       transcript object returned by Vosk engine.
 *   @property {Number}                latency      transcript elpased time in msecs
 *
 * @param {Buffer}                     buffer       input buffer, in PCM format
 * @param {ModelObject}                model        the Vosk model returned by InitModel()
 * @param {VoskRecognizerArgsObject}   [options]    Vosk Recognizer arguments setting. Optional. 
 *
 * @return {Promise<RecognizeObject>} 
 *
 */ 
async function transcriptFromBuffer(buffer, model, { multiThreads=true, sampleRate=SAMPLE_RATE, grammar=null } = {}) {

  const latencyStart = new Date()

  // if a grammar is specified, pass it to the Vosk Recognizer
  const voskRecognizerArgs = grammar ? 
    {model, sampleRate, grammar} :
    {model, sampleRate}

  // create Vosk recognizer
  const recognizer = new vosk.Recognizer(voskRecognizerArgs)
   
  // https://gist.github.com/wpscholar/270005d42b860b1c33cf5ab25b37928a
  // https://stackoverflow.com/questions/47089230/how-to-convert-buffer-to-stream-in-nodejs
  
  //
  // WARNING
  // From vosk version 0.3.25
  // the acceptWaveformAsync function runs in a dedicated thread.
  // That wold improve performances in case of cocurrent requests 
  // from the caller (server) program  
  //
  // Previous vosk version 0.3.25
  // const end_of_speech = recognizer.acceptWaveform(data)
  //
  if ( multiThreads ) 
    await recognizer.acceptWaveformAsync(buffer)
  else
    recognizer.acceptWaveform(buffer)

  // copy final Vosk engine result object
  const result = {...recognizer.finalResult(recognizer)} 

  recognizer.free()
    
  const latency = new Date() - latencyStart

  return Promise.resolve( {result, latency} )

}


/**
 * @function freeModel
 * @public
 *
 * @param {ModelObject} model
 *
 */ 
function freeModel(model) {
  model.free()
}  


/**
 * test section
 */

function helpAndExit() {
  console.log()
  console.log('  Usage')
  console.log()
  console.log('    voskjs --model=<model directory> \\ ')
  console.log('           --audio=<audio file name> \\ ')
  console.log('           --grammar=<list of comma-separated words or sentences> \\ ')
  console.log()    
  console.log('  Examples')
  console.log()
  console.log('    Recognize a speech file using a specific model directory:')
  console.log()
  console.log('      voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2')
  console.log()
  console.log('    Recognize a speech file using a grammar (allowed by a specific model):')
  console.log()
  console.log('      voskjs --audio=audio/2830-3980-0043.wav \\ ')
  console.log('             --model=models/vosk-model-small-en-us-0.15 \\ ')
  console.log('             --grammar="experience proves this, bla bla bla"')
  console.log()
  process.exit(1)
}  

/**
 * @function checkArgs
 * command line parsing
 *
 * @param {String}    args
 *
 * @typedef {Object}  SentenceAndAttributes
 * @property {String} language 
 * @returns {SentenceAndAttributes}
 * 
 */
function checkArgs(args) {

  const modelDirectory = args.model 
  const audioFile = args.audio 
  const grammar = args.grammar 

  if ( !modelDirectory ) 
    helpAndExit()

  if ( !audioFile ) 
    helpAndExit()
  
  return { 
    modelDirectory, 
    audioFile, 

    // if grammar args is present, as comma separated sentences,
    // convert it in an array of strings
    grammar: grammar ? grammar.split(',').map(sentence => sentence.trim()) : undefined }
}


/**
 * @function main
 * unit test
 */
async function main() {

  // get command line arguments 
  const { args } = getArgs()
  const { modelDirectory, audioFile, grammar } = checkArgs(args)

  // set the vosk log level to silence 
  logLevel(-1) 

  console.log()
  console.log(`model directory      : ${modelDirectory}`)
  console.log(`speech file name     : ${audioFile}`)
  console.log(`grammar              : ${grammar ? grammar : 'not specified'}`)
  console.log()

  // load in memory a Vosk directory model
  const { model, latency } = await loadModel(modelDirectory)

  console.log(`load model latency   : ${latency}ms`)
  console.log()

  // speech recognition from an audio file
  try {
    const { result, latency } = await transcriptFromFile(audioFile, model, {grammar})

    console.log(result)
    console.log()
    console.log(`transcript latency : ${latency}ms`)
    console.log()
  }  
  catch(error) {
    console.error(error) 
  }  

  // free the runtime model
  freeModel(model)

}


if (require.main === module) 
  main()

module.exports = { 
  logLevel,
  loadModel,
  transcriptFromBuffer,
  transcriptFromFile,
  transcript: transcriptFromFile, // alias
  freeModel
}

