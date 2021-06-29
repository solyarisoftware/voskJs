const util = require('util')
const { logLevel, loadModel, transcriptFromFile, freeModel } = require('../voskjs')
const { setTimer, getTimer } = require('../lib/chronos')

async function main() {

  //  const modelDirectory = '../models/vosk-model-en-us-aspire-0.2'
  const modelDirectory = '../models/vosk-model-small-en-us-0.15'
  //const audioFile = '../audio/2830-3980-0043.wav'
  const audioFile = '../audio/sentencesWithSilences.wav'

  console.log(`model directory      : ${modelDirectory}`)
  console.log(`speech file name     : ${audioFile}`)

  // set the vosk log level to silence 
  logLevel(-1) 

  setTimer('loadModel')

  // load in memory a Vosk directory model
  const model = loadModel(modelDirectory)

  console.log(`load model latency   : ${getTimer('loadModel')}ms`)

  // speech recognition of an audio file
  try {

    setTimer('transcript')

    const result = await transcriptFromFile(audioFile, model)

    console.log(util.inspect(result, {showHidden: false, depth: null}))
    console.log(`transcript latency : ${getTimer('transcript')}ms`)
  }  
  catch (error) {
    console.error(error) 
  }  

  // free the Vosk runtime model
  freeModel(model)
}

main()
