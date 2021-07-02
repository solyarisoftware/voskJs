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
 * @see https://github.com/alphacep/vosk-api/blob/master/nodejs/index.js#L207
 * @see https://www.tutorialsteacher.com/nodejs/nodejs-eventemitter
 * util.inherits(vosk.Recognizer, emitter)
 */ 

const fs = require('fs')
const util = require('util')
const emitter = require('events').EventEmitter

const { Readable } = require('stream')
const wav = require('wav')
const vosk = require('vosk')

const { info } = require('./lib/info')
const { getArgs } = require('./lib/getArgs')
const { setTimer, getTimer, unixTimeMsecs } = require('./lib/chronos')


/**
 * @constant
 */
const SAMPLE_RATE = 16000

const PARTIAL_RESULT_EVENT = 'partial' 
const END_OF_SPEECH_EVENT = 'endOfSpeech' 
const FINAL_RESULT_EVENT = 'final' 


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

  // check if model directory exists, async
  fs.access(modelDirectory, (err) => {
    if (err) 
      throw `${err}: file ${modelDirectory} not found.`
  })
  
  // create new run time model from the specified directory 
  // TODO try/catch?
  const model = new vosk.Model(modelDirectory)

  return model 

}  


/**
 * @function createRecognizer 
 *
 * Create a run time Vosk recognizer 
 *
 * @typedef VoskRecognizerArgsObject
 * @property {Boolean}                 multiThreads if true, an external (Vosk engine) thread is spawned on the fly
 *                                                  that need in server (concurrent requests) architecture.
 * @property {Number}                  sampleRate   Default value: 16000
 * @property {String[]}                grammar      array of words, or sentences
 * @property {Number}                  alternatives maximum alternatives to return from recognition results
 * @property {Boolean}                 words        if true, recognizer result will include word by word details
 * @example
 *   {
 *     result: [
 *       { conf: 1, end: 1.02, start: 0.36, word: 'experience' },
 *         { conf: 1, end: 1.35, start: 1.02, word: 'proves' },
 *        { conf: 1, end: 1.74, start: 1.35, word: 'this' }
 *      ],
 *      text: 'experience proves this'
 *    }
 *
 * @param {ModelObject}                model        the Vosk model returned by InitModel()
 * @param {VoskRecognizerArgsObject}  [options]     Vosk Recognizer arguments setting. Optional
 * @return {VoskRecognizerObject}
 *
 */ 
function createRecognizer(model, { sampleRate=SAMPLE_RATE, grammar=null, alternatives=0, words=true } = {}) {

  // if a grammar is specified, pass it to the Vosk Recognizer
  const voskRecognizerArgs = grammar ? 
    {model, sampleRate, grammar} :
    {model, sampleRate}

  // create Vosk recognizer
  // TODO try/catch?
  const recognizer = new vosk.Recognizer(voskRecognizerArgs)

  if ( alternatives )
    recognizer.setMaxAlternatives(alternatives)

  recognizer.setWords(words)

  return recognizer
}


/**
 * @function transcriptFromFile
 * speech recognition into a text, from an audio file, given a specified Vosk model
 *
 * @alias transcript
 * @public
 * @async
 *
 * @param {String}                     fileName     the name of speech file, in WAV format
 * @param {ModelObject}                model        the Vosk model returned by InitModel()
 * @param {VoskRecognizerArgsObject}   [options]    Vosk Recognizer arguments setting. Optional. 
 *
 * @return {Promise<VoskResultObject>} transcript object returned by Vosk engine
 *
 */ 
async function transcriptFromFile(fileName, model, { multiThreads=true, sampleRate=SAMPLE_RATE, grammar=null, alternatives=0, words=true } = {}) {

  const DEBUG = false

  return new Promise( (resolve, reject) => {

    // validate audiofile existence, async
    fs.access(fileName, (err) => {
      if (err) 
        return reject(`${err}: file ${fileName} not found.`)
    })

    if (DEBUG)
      setTimer('createRecognizer')

    const recognizer = createRecognizer( model, {sampleRate, grammar, alternatives, words} )

    if (DEBUG)
      console.log(`recognizer latency   : ${getTimer('createRecognizer')}ms`)

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
        // That wold improve performances in case of concurrent requests 
        // from the caller (server) program  
        //
        // Previous vosk version 0.3.25
        // const end_of_speech = recognizer.acceptWaveform(data)
        //
        const end_of_speech = multiThreads ? 
          await recognizer.acceptWaveformAsync(data) : 
          recognizer.acceptWaveform(data)

        //
        // WARNING
        // 1. AcceptWaveform returns true when silence is detected and you can retrieve the result with Result(). 
        // 2. If silence is not detected you can retrieve PartialResult() only. 
        // 3. FinalResult means the stream is ended, you flush the buffers and retrieve remaining result.
        // By Nicolay Shmirev. See: https://github.com/alphacep/vosk-api/issues/590#issuecomment-863065813
        //
        if (end_of_speech) {
          // End of speech means silence detected.
          // We want to transcript all the audio so the processing continue until the end.

          // debug
          //console.log('DEBUG', END_OF_SPEECH_EVENT, recognizer.result())
          continue

        }
        //else
        // console.log('partialResult', recognizer.partialResult())
        
      }

      // copy final Vosk engine result object
      const result = {...recognizer.finalResult(recognizer)} 

      recognizer.free()
      
      return resolve(result)

    })
  })

}


/**
 * @function transcriptEventsFromFile
 *
 * speech recognition into a text, from an audio file, given a specified Vosk model,
 * return an events emitter
 *
 * @public
 *
 * @param {String}                     fileName     the name of speech file, in WAV format
 * @param {ModelObject}                model        the Vosk model returned by InitModel()
 * @param {VoskRecognizerArgsObject}   [options]    Vosk Recognizer arguments setting. Optional. 
 *
 * @return {Emitter}                   emit events
 *
 */ 
function transcriptEventsFromFile(fileName, model, { multiThreads=true, sampleRate=SAMPLE_RATE, grammar=null, alternatives=0, words=true } = {}) {

  const DEBUG = false

  // validate audiofile existence, async
  fs.access(fileName, (err) => {
    if (err) 
      throw (`${err}: file ${fileName} not found.`)
  })

  if (DEBUG)
    setTimer('createRecognizer')

  // the function is enabled to emit events 
  const event = new emitter()

  const recognizer = createRecognizer( model, {sampleRate, grammar, alternatives, words} )

  if (DEBUG)
    console.log(`recognizer latency   : ${getTimer('createRecognizer')}ms`)

  const wfStream = fs.createReadStream(fileName, {'highWaterMark': 4096})
  const wfReader = new wav.Reader()
  
  wfStream.pipe(wfReader)
  
  const pcmChunks = new Readable().wrap(wfReader)

  wfReader.on('format', async ( { audioFormat, sampleRate, channels } ) => {
      
    if (audioFormat != 1 || channels != 1)
      throw (`${fileName}: audio file (sample rate: ${sampleRate}) must be WAV format mono PCM.`)

    const lastPartialResult = {}

    for await (const data of pcmChunks) {

      //
      // WARNING
      // From vosk version 0.3.25
      // the acceptWaveformAsync function runs in a dedicated thread.
      // That wold improve performances in case of concurrent requests 
      // from the caller (server) program  
      //
      // Previous vosk version 0.3.25
      // const end_of_speech = recognizer.acceptWaveform(data)
      //
      const end_of_speech = multiThreads ? 
        await recognizer.acceptWaveformAsync(data) : 
        recognizer.acceptWaveform(data)

      //
      // WARNING
      // Emit partial result events
      // 1. AcceptWaveform returns true when silence is detected and you can retrieve the result with Result(). 
      // 2. If silence is not detected you can retrieve PartialResult() only. 
      // 3. FinalResult means the stream is ended, you flush the buffers and retrieve remaining result.
      // By Nicolay Shmirev. See: https://github.com/alphacep/vosk-api/issues/590#issuecomment-863065813
      //
      if (end_of_speech)
        event.emit(END_OF_SPEECH_EVENT, recognizer.result())
      else {
        const partialResult = recognizer.partialResult()

        // Doesn't emit duplicated events:
        // Is the current partialResult different form the last one?
        // If true a new event is emiitted.
        // This avoid "duplicated" events to be emitted
        if (partialResult.partial !== lastPartialResult.partial) {
          event.emit(PARTIAL_RESULT_EVENT, partialResult)
          lastPartialResult.partial = partialResult.partial
        }
      }
    }  
    
    //
    // WARNING
    // Emit partial result events
    // 1. AcceptWaveform returns true when silence is detected and you can retrieve the result with Result(). 
    // 2. If silence is not detected you can retrieve PartialResult() only. 
    // 3. FinalResult means the stream is ended, you flush the buffers and retrieve remaining result.
    // By Nicolay Shmirev. See: https://github.com/alphacep/vosk-api/issues/590#issuecomment-863065813
    //
    event.emit(FINAL_RESULT_EVENT, recognizer.finalResult(recognizer)) 

    recognizer.free()
    
  })

  return event

}


/**
 * @function transcriptFromBuffer
 * speech recognition into a text, from an audio file, given a specified Vosk model
 *
 * @alias transcript
 * @public
 * @async
 *
 * @param {Buffer}                     buffer       input buffer, in PCM format
 * @param {ModelObject}                model        the Vosk model returned by InitModel()
 * @param {VoskRecognizerArgsObject}   [options]    Vosk Recognizer arguments setting. Optional. 
 *
 * @return {Promise<VoskResultObject>} transcript object returned by Vosk engine
 *
 */ 
async function transcriptFromBuffer(buffer, model, { multiThreads=true, sampleRate=SAMPLE_RATE, grammar=null, alternatives=0, words=true } = {}) {

  const recognizer = createRecognizer( model, {sampleRate, grammar, alternatives, words} )
   
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
    
  return Promise.resolve(result)

}


/**
 * @function transcriptEventsFromBuffer
 * speech recognition into a text, from an audio file, given a specified Vosk model
 *
 * @alias transcript
 * @public
 * @async
 *
 * @param {Buffer}                     buffer       input buffer, in PCM format
 * @param {ModelObject}                model        the Vosk model returned by InitModel()
 * @param {VoskRecognizerArgsObject}   [options]    Vosk Recognizer arguments setting. Optional. 
 *
 * @return {Emitter}                                
 *
 */ 
async function transcriptEventsFromBuffer(buffer, model, { multiThreads=true, sampleRate=SAMPLE_RATE, grammar=null, alternatives=0, words=true } = {}) {

  // the function is enabled to emit events 
  const event = new emitter()

  const recognizer = createRecognizer( model, {sampleRate, grammar, alternatives, words} )
   
  // https://gist.github.com/wpscholar/270005d42b860b1c33cf5ab25b37928a
  // https://stackoverflow.com/questions/47089230/how-to-convert-buffer-to-stream-in-nodejs
  
  const lastPartialResult = {}

  for(;;) {

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
      await recognizer.acceptWaveformAsync(buffer) : 
      recognizer.acceptWaveform(buffer)

    //
    // WARNING
    // Emit partial result events
    // 1. AcceptWaveform returns true when silence is detected and you can retrieve the result with Result(). 
    // 2. If silence is not detected you can retrieve PartialResult() only. 
    // 3. FinalResult means the stream is ended, you flush the buffers and retrieve remaining result.
    // By Nicolay Shmirev. See: https://github.com/alphacep/vosk-api/issues/590#issuecomment-863065813
    //
    if (end_of_speech)  {
      event.emit(END_OF_SPEECH_EVENT, recognizer.result())
      continue
    }
    else {
      const partialResult = recognizer.partialResult()

      // Doesn't emit duplicated events:
      // Is the current partialResult different form the last one?
      // If true a new event is emiitted.
      // This avoid "duplicated" events to be emitted
      if (partialResult.partial !== lastPartialResult.partial) {
        event.emit(PARTIAL_RESULT_EVENT, partialResult)
        lastPartialResult.partial = partialResult.partial
      }

      break
    }  
  }

  //
  // WARNING
  // if end_Of_Speech is detected (the buffere contains a sentence followed by a silence)
  // and the result() function is called, so
  // the finalResult() contains just the remaining (last) part of the sentence before the end of the audio.
  // It's up to user to collect events data assempling the final textual (multisentence) result.
  //
  event.emit(FINAL_RESULT_EVENT, recognizer.finalResult())

  recognizer.free()
    
  return event

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
  console.log('voskjs is a CLI utility to test Vosk-api features')
  console.log (info())
  console.log()
  console.log('Usage')
  console.log()
  console.log('  voskjs \\ ')
  console.log('    --model=<model directory> \\ ')
  console.log('    --audio=<audio file name> \\ ')
  console.log('    [--grammar=<list of comma-separated words or sentences>] \\ ')
  console.log('    [--samplerate=<Number, usually 16000 or 8000>] \\ ')
  console.log('    [--alternatives=<number of max alternatives in text result>] \\ ')
  console.log('    [--textonly] \\ ')
  console.log('    [--tableevents] \\ ')
  console.log('    [--objectevents] \\ ')
  console.log('    [--debug=<Vosk debug level>] ')
  console.log()    
  console.log('Examples')
  console.log()
  console.log('  1. Recognize a speech file using a specific model directory:')
  console.log()
  console.log('     voskjs --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2')
  console.log()
  console.log('  2. Recognize a speech file setting a grammar (with a dynamic graph model) and a number of alternative:')
  console.log()
  console.log('     voskjs \\ ')
  console.log('       --audio=audio/2830-3980-0043.wav \\ ')
  console.log('       --model=models/vosk-model-small-en-us-0.15 \\ ')
  console.log('       --grammar="experience proves this, bla bla bla"')
  console.log('       --alternatives=3')
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

  // mandatory arguments
  const modelDirectory = args.model 
  const audioFile = args.audio 

  // optional arguments
  const grammar = args.grammar 
  const sampleRate = args.samplerate 
  const alternatives = args.alternatives 
  const textOnly = args.textonly 
  const tableevents = args.tableevents 
  const objectevents = args.objectevents 


  // if not specified, set default Vosk debug level to -1 (silent mode)
  const debug = args.debug ? args.debug : -1

  if ( !modelDirectory ) 
    helpAndExit()

  if ( !audioFile ) 
    helpAndExit()

  return { 
    modelDirectory, 
    audioFile, 

    // if grammar args is present, as comma separated sentences,
    // convert it in an array of strings
    grammar: grammar ? grammar.split(',').map(sentence => sentence.trim()) : undefined, 

    // convert to Number
    sampleRate: sampleRate ? +sampleRate : undefined,

    alternatives,
    textOnly, 
    tableevents, 
    objectevents, 
    debug
  }
}


function printObject(object, args) {
   const defaultArgs = {showHidden:false, breakLength:Infinity, depth:null, colors:true}
   return util.inspect(object,  {...defaultArgs, ...args } )
}  


function printResultsAsTable(results) {

  console.log ('Events table:')
  console.log ()

  console.log('| %s | %s | %s |',
    'time'.padEnd(6), 
    'event'.padEnd(12), 
    'text'.padEnd(40)
  )
  console.log('| %s | %s | %s |',
    '-'.repeat(6), 
    '-'.repeat(12), 
    '-'.repeat(40)
  )

  for (const result of results) {
  
    if ( result.event === PARTIAL_RESULT_EVENT )
      console.log('| %s | %s | %s',
        result.time.toString().padStart(6),
        result.event.padEnd(12),
        result.data.partial //.padStart(11+6+2+1)
      )

    if ( result.event === END_OF_SPEECH_EVENT )
      console.log('| %s | %s | %s',
        result.time.toString().padStart(6),
        result.event.padEnd(12),
        result.data.text //.padStart(11+6+2+1)
      )
    
    if ( result.event === FINAL_RESULT_EVENT )
      console.log('| %s | %s | %s',
        result.time.toString().padStart(6),
        result.event.padEnd(12),
        result.data.text //.padStart(11+6+2+1)
      )
  }

  console.log()

}  


function statistics(modelDirectory, audioFile, grammar, sampleRate, alternatives, textOnly, tableevents, objectevents, debug, sentences) {

  console.log('voskjs is a CLI utility to test Vosk-api features')
  console.log (info())
  console.log()
  console.log('Statistics:')
  console.log()
  console.log(`model directory      : ${modelDirectory}`)
  console.log(`speech file name     : ${audioFile}`)
  console.log(`grammar              : ${grammar ? grammar : 'not specified. Default: NO'}`)
  console.log(`sample rate          : ${sampleRate ? sampleRate : 'not specified. Default: 16000'}`)
  console.log(`max alternatives     : ${alternatives}`)
  console.log(`text only / JSON     : ${textOnly ? 'text' : 'JSON'}`)
  console.log(`Vosk debug level     : ${debug}`)
  console.log()
  console.log(`load model latency   : ${getTimer('loadModel')}ms`)
  console.log(`transcript latency   : ${getTimer('transcript')}ms`)
  console.log(`transcript text      : ${sentences.join(' ')}`)
  console.log()

}  


/**
 * @function main
 * unit test
 */
async function main() {

  // get command line arguments 
  const { args } = getArgs()
  const { modelDirectory, audioFile, grammar, sampleRate, alternatives, textOnly, tableevents, objectevents, debug } = checkArgs(args)
  const words = ! textOnly

  // set the vosk log level to silence 
  logLevel(debug) 

  setTimer('loadModel')

  // load in memory a Vosk directory model
  const model = loadModel(modelDirectory)

  setTimer('transcript')
  const startSentenceTimer = unixTimeMsecs()

  let transcriptEvents
  const sentences = [] 
  const results = [] 

  // speech recognition from an audio file
  try {
    transcriptEvents = transcriptEventsFromFile(audioFile, model, {grammar, sampleRate, alternatives, words})
  }  
  catch(error) {
    console.error(error) 
  }  

  transcriptEvents.on(PARTIAL_RESULT_EVENT, data => {
    
    if ( !textOnly ) { 

      const dataItem = { 
        time: unixTimeMsecs() - startSentenceTimer,
        event: PARTIAL_RESULT_EVENT,
        data
      }

      results.push(dataItem) 

    }  
  
  })  

  transcriptEvents.on(END_OF_SPEECH_EVENT, data => {
    
    sentences.push(data.text) 
    
    if ( ! textOnly ) {
      
      const dataItem = { 
        time: unixTimeMsecs() - startSentenceTimer,
        event: END_OF_SPEECH_EVENT,
        data
      }

      results.push(dataItem) 

    }  
  
  })  
  
  transcriptEvents.on(FINAL_RESULT_EVENT, data => {
    
    sentences.push(data.text) 

    if ( textOnly ) {
      console.log(sentences.join(' '))
    }  
    else {

      const dataItem = { 
        time: unixTimeMsecs() - startSentenceTimer,
        event: FINAL_RESULT_EVENT,
        data
      }

      results.push(dataItem) 

      if ( !textOnly )
        statistics(modelDirectory, audioFile, grammar, sampleRate, alternatives, textOnly, tableevents, objectevents, debug, sentences)

      if ( !textOnly && tableevents)
        printResultsAsTable(results)

      if ( !textOnly && objectevents)
        console.log(printObject(results, {breakLength:80}))

    }
  
  })  

  // free the runtime model
  freeModel(model)

}


if (require.main === module) 
  main()

module.exports = { 
  logLevel,
  loadModel,
  transcriptFromBuffer,
  transcriptEventsFromBuffer,
  transcriptFromFile,
  transcriptEventsFromFile,
  //transcript: transcriptFromFile, // alias
  freeModel
}

