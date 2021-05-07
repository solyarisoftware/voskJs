#!/usr/bin/env node

/**
 * @module voskjs 
 *
 * logLevel()
 * loadModel()
 * transcript()
 * freeModel()
 */
const vosk = require('vosk')

const fs = require('fs')
const path = require('path')
const { Readable } = require('stream')
const wav = require('wav')

const { getArgs } = require('./lib/getArgs')

const SAMPLE_RATE = 16000.0

/**
 * logLevel
 *
 * Set log level for Vosk/Kaldi messages
 * @param {number} level   The higher, the more verbose. 0 for infos and errors. Less than 0 for silence. 
 */
function logLevel(level=0) {

  // set vosk log level
  vosk.setLogLevel(level)

}  


/**
 * loadModel
 * create new run time model from the specified directory 
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
    
    // validate model directory existence, async
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
 * transcript
 * speech recognition into a text, from an audio file, given a specified Vosk model
 *
 * @async
 * @public
 * @param {String}                   fileName  the name of speech file, in WAV format
 * @param {ModelObject}              model     the Vosk model returned by InitModel()
 * @param {VoskRecognizerArgsObject} [options] Vosk Recognizer arguments setting. Optional. 
 *
 * @return {Promise<TranscriptObject>} 
 *
 * @typedef VoskRecognizerArgsObject
 *   @property {Boolean}               multiThreads if true, an external (Vosk engine) thread is spawned on the fly
 *                                                  that need in server (concurrent requests) architecture.
 *   @property {String[]}              grammar      array of words, or sentences
 *
 * @typedef TranscriptObject
 *   @property {VoskResultObject}      result       transcript object returned by Vosk engine.
 *   @property {Number}                latency      transcript elpased time in msecs
 *
 */ 
function transcript(fileName, model, options={multiThreads:true, grammar:null}) {

  return new Promise( (resolve, reject) => {

    const latencyStart = new Date()

    // validate audiofile existence, async
    fs.access(fileName, (err) => {
      if (err) 
        return reject(`${err}: file ${fileName} not found.`)
    })

    // if a grammar is specified, pass it to the Vosk Recognizer
    const voskRecognizerArgs = options.grammar ? 
      {model, sampleRate: SAMPLE_RATE, grammar: options.grammar} :
      {model, sampleRate: SAMPLE_RATE}

    const rec = new vosk.Recognizer(voskRecognizerArgs)

    const wfStream = fs.createReadStream(fileName, {'highWaterMark': 4096})
    const wfReader = new wav.Reader()

    wfStream.pipe(wfReader)
    wfReader.on('format', async ( { audioFormat, sampleRate, channels } ) => {
        
      if (audioFormat != 1 || channels != 1 || sampleRate != SAMPLE_RATE) {
        //throw new Error('Audio file must be WAV format mono PCM.')
        return reject(`${fileName}: audio file must be WAV format mono PCM with sample rate: ${SAMPLE_RATE}.`)
      }

      for await (const data of new Readable().wrap(wfReader)) {

        //
        // WARNING
        // From vosk version 0.3.25
        // the acceptWaveformAsync function runs in a dedicated thread.
        // That wold improve performances in case of cocurrent requests 
        // from the caller (server) program  
        //
        // Previous vosk version 0.3.25
        // const end_of_speech = rec.acceptWaveform(data)
        //
        const end_of_speech = options.multiThreads ? 
          await rec.acceptWaveformAsync(data) : 
          rec.acceptWaveform(data)

        if (end_of_speech) {
          console.log(rec.result())
        }
      
      }

      // copy final Vosk engine result object
      const result = {...rec.finalResult(rec)} 

      rec.free()
      
      const latency = new Date() - latencyStart

      return resolve( {result, latency} )

    })
  })

}


/**
 * freeModel
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

function helpAndExit(programName) {
  console.log()
  console.log('usage:')
  console.log()
  console.log(`    ${programName} --model=<model directory> --audio=<audio file name>`)
  console.log()    
  console.log('example:')
  console.log()
  console.log(`    ${programName} --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2`)
  console.log()
  process.exit(1)
}  

/**
 * checkArgs
 * command line parsing
 *
 * @param {String}                    args
 * @param {String}                    programName
 *
 * @returns {SentenceAndAttributes}
 * @typedef {Object} SentenceAndAttributes
 * @property {String} language 
 * 
 */
function checkArgs(args, programName) {

  const modelDirectory = args.model 
  const audioFile = args.audio 

  if ( !modelDirectory ) 
    helpAndExit(programName)

  if ( !audioFile ) 
    helpAndExit(programName)
  
  return { modelDirectory, audioFile }
}


/**
 * unit test main 
 */
async function main() {

  // get command line arguments 
  const { args } = getArgs()
  const { modelDirectory, audioFile } = checkArgs(args, path.basename(__filename, '.js'))

  // set the vosk log level to silence 
  logLevel(-1) 

  // load in memory a Vosk directory model
  const { model, latency } = await loadModel(modelDirectory)

  // console.dir(model)
  console.log(`load model latency  : ${latency}ms`)

  // speech recognition from an audio file
  try {
    const { result, latency } = await transcript(audioFile, model)

    console.log(result)
    console.log(`transcript latency : ${latency}ms`)
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
  transcript,
  recognize: transcript, // alias
  freeModel
}

