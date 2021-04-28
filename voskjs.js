const vosk = require('vosk')

const fs = require('fs')
const path = require('path')
const { Readable } = require('stream')
const wav = require('wav')

const { getArgs } = require('./lib/getArgs')

const DEBUG = true
const SAMPLE_RATE = 16000.0


/**
 * public module functions section
 *
 * initModel()
 * transcript()
 * freeModel()
 */

/**
 * initModel
 * create new run time model from the specified directory 
 *
 * @async
 * @public
 *
 * @param {String} modelDirectory
 * @param {Number} logLevel
 *
 * @return {promise<ModelObject>}
 * @example
 *   Model {
 *   handle: <Buffer@0x565ae50 type: { size: 0, indirection: 1, get: [Function: get], set: [Function: set], name: 'void' }>
 *   }
 *
 */ 
function initModel(modelDirectory, logLevel=0) {
  return new Promise( (resolve, reject) => {

    const start = new Date()

    // set vosk log level
    vosk.setLogLevel(logLevel)
    
    if (DEBUG) {
      console.log()
      console.log(`log level          : ${logLevel}`)
      console.log()
    }

    // validate model directory existence, async
    fs.access(modelDirectory, (err) => {
      if (err) 
        return reject(`${err}: file ${modelDirectory} not found.`)
    })
    
    // create new run time model from the specified directory 
    const model = new vosk.Model(modelDirectory)

    if (DEBUG) {
      const end = new Date() - start
      console.log()
      console.log(`init model elapsed : ${end}ms`)
    }  

    return resolve(model)
  })
}  


/**
 * transcript
 * speech recognition into a text, from an audio file, given a specified model
 *
 * @async
 * @public
 *
 * @param {String}      fileName     the name of speech file, in WAV format
 * @param {ModelObject} model        the Vosk model returned by InitModel()
 * @param {Boolean}     multiThreads if true, an external (Vosk engine) thread is spawn
 *                                   that's need for in server architecture
 *
 * @return {Promise<ModelObject>} 
 * @example 
 *  {
 *    result: [
 *      { conf: 0.980891, end: 1.02, start: 0.33, word: 'experience' },
 *      { conf: 1, end: 1.349903, start: 1.02, word: 'proves' },
 *      { conf: 0.996779, end: 1.71, start: 1.35, word: 'this' }
 *    ],
 *    text: 'experience proves this'
 *  }
 *
 */ 
function transcript(fileName, model, multiThreads=true) {
  return new Promise( (resolve, reject) => {

    const start = new Date()

    // validate audiofile existence, async
    fs.access(fileName, (err) => {
      if (err) 
        return reject(`${err}: file ${fileName} not found.`)
    })

    const rec = new vosk.Recognizer( {model, sampleRate: SAMPLE_RATE } )
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
        // From vosk version 0.3.25
        // the acceptWaveformAsync function runs in a dedicated thread.
        // That wold improve performances in case of cocurrent requests 
        // from the caller (server) program  
        //
        // Previous vosk version 0.3.25
        // const end_of_speech = rec.acceptWaveform(data)
        //
        const end_of_speech = multiThreads ? 
          await rec.acceptWaveformAsync(data) : 
          rec.acceptWaveform(data)

        if (end_of_speech) {
          console.log(rec.result())
        }
      
      }

      const finalResult = {...rec.finalResult(rec)} 
      rec.free()
      
      if (DEBUG) {
        const end = new Date() - start
        console.log(`transcript elapsed : ${end}ms`)
        console.log()
      }  

      return resolve(finalResult)

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
  const { modelDirectory, audioFile } = checkArgs(args, `node ${path.basename(__filename, '.js')}`)

  // create a runtime model
  const model = await initModel(modelDirectory)

  // console.dir(model)

  // speech recognition from an audio file
  try {
    const result = await transcript(audioFile, model) 

    console.log(result)
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
  initModel,
  transcript,
  freeModel
}

