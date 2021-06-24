const util = require('util')
const { logLevel, loadModel, transcriptFromFile, freeModel } = require('../voskjs')
const { setTimer, getTimer } = require('../lib/chronos')

const { spellingEnglishCharacters } = require('./spellingEnglishCharacters')
const { spellingItalianCharacters } = require('./spellingItalianCharacters')


/**
 * @see https://alphacephei.com/vosk/adaptation
 */ 
async function main() {
  
  //const grammar = undefined
  const grammar = spellingEnglishCharacters
  //const grammar = spellingItalianCharacters
  
  // English language dynamic graph small model
  const modelDirectory = '../models/vosk-model-small-en-us-0.15'
  //const modelDirectory = '../models/vosk-model-en-us-aspire-0.2'

  // Italian language dynamic graph small model
  //const modelDirectory = '../models/vosk-model-small-it-0.4'

  //const audioFile = '../audio/2830-3980-0043.wav' // -> experience proves this
  //const audioFile = '../audio/4507-16021-0012.wav' // -> why should one hold on the way
  //const audioFile = '../audio/8455-210777-0068.wav' // -> your power is sufficient i said

  // English language ISO6346 samples
  const audioFile = '../audio/EN_CSQU3054383.wav' // -> charlie for c ...

  // Italian language ISO6346 samples
  //const audioFile = '../audio/IT_CSQU3054383.wav'
  //const audioFile = '../audio/IT_CSQU3054383_long.wav'
  //const audioFile = '../audio/IT_RAIU_690011_4_25_U1.wav'
  
  console.log(`model directory      : ${modelDirectory}`)
  console.log(`speech file name     : ${audioFile}`)
  console.log(`grammar              : ${grammar}`)

  // set the vosk log level to silence 
  logLevel(-1) 

  setTimer('loadModel')

  // load in memory a Vosk directory model
  const model = loadModel(modelDirectory)

  console.log(`load model latency   : ${getTimer('loadModel')}ms`)

  // speech recognition of an audio file
  try {
    setTimer('transcript')
    const result = await transcriptFromFile(audioFile, model, {grammar, words:true})

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
