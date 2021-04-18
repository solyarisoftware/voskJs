const vosk = require('vosk')
const fs = require('fs')
const { Readable } = require('stream')
const wav = require('wav')
const { getArgs } = require('./getArgs')

const DEBUG = true

let model

/**
 * initModel
 *
 */ 
function initModel(modelDirectory, logLevel=0) {

  let start, end
  start = new Date()

  vosk.setLogLevel(logLevel)
  
  if (DEBUG) {
    console.log()
    console.log(`log level          : ${logLevel}`)
    console.log()
  }
  
  // create new run time model from the specified directory 
  model = new vosk.Model(modelDirectory)

  if (DEBUG) {
    end = new Date() - start
    console.log()
    console.log(`init elapsed       : ${end}ms`)
  }  
}  


/**
 * freeModel
 *
 */ 
function freeModel() {
  model.free()
}  


/**
 * transcript
 *
 */ 
function transcript(fileName) {
  return new Promise((resolve, reject) => {

    let start, end
    start = new Date()

    const rec = new vosk.Recognizer({model: model, sampleRate: 16000.0})
    const wfStream = fs.createReadStream(fileName, {'highWaterMark': 4096})
    const wfReader = new wav.Reader()

    wfStream.pipe(wfReader)
    wfReader.on('format', async ({ audioFormat, sampleRate, channels }) => {
        
      if (audioFormat != 1 || channels != 1) {
        //throw new Error('Audio file must be WAV format mono PCM.')
        return reject(`${fileName}: audio file must be WAV format mono PCM.`)
      }

      for await (const data of new Readable().wrap(wfReader)) {

        const end_of_speech = rec.acceptWaveform(data)

        if (end_of_speech) {
          console.log(rec.result())
        }
      
      }

      const finalResult = {...rec.finalResult(rec)} 
      rec.free()
      //console.log( finalResult )
      
      if (DEBUG) {
        end = new Date() - start
        console.log(`transcript elapsed : ${end}ms`)
        console.log()
      }  

      return resolve(finalResult)

    })
  })
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

  const model = args.model 
  const audio = args.audio 

  if ( !model ) 
    helpAndExit(programName)

  if ( !audio ) 
    helpAndExit(programName)
  
  return { model, audio }
}

function helpAndExit(programName) {
  console.log()
  console.log('usage:')
  console.log()
  console.log(`    ${programName} \\ `)
  console.log('         --model=<model directory> \\ ')
  console.log('         --audio=<audio file name>')
  console.log()    
  console.log('example:')
  console.log()
  console.log(`    ${programName} --audio=audio/2830-3980-0043.wav --model=models/vosk-model-en-us-aspire-0.2`)
  console.log()
  process.exit(1)
}  


/**
 * unit test main 
 */
async function main() {

  //const model = 'models/vosk-model-en-us-aspire-0.2'
  //const audio = 'audio/2830-3980-0043.wav'
  
  const { args } = getArgs()
  const { model, audio } = checkArgs(args, 'node transcript')

  initModel(model)

  try {
    const result = await transcript(audio) 
    console.log(result)
    console.log()
  }  
  catch(error) {
    console.error(error) 
  }  

  freeModel()

}


if (require.main === module) 
  main()

module.exports = { 
  initModel,
  transcript,
  freeModel
}

