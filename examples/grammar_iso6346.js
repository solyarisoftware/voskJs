const { logLevel, loadModel, transcript, freeModel } = require('../voskjs')

const { spellingEnglishCharacters } = require('./spellingEnglishCharacters')
const { spellingItalianCharacters } = require('./spellingEnglishCharacters')


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

  // load in memory a Vosk directory model
  const { model, latency } = await loadModel(modelDirectory)

  console.log(`load model latency   : ${latency}ms`)

  // speech recognition of an audio file
  try {
    const { result, latency } = await transcript(audioFile, model, {grammar})

    console.log( result )
    console.log(`transcript latency : ${latency}ms`)
  }  
  catch (error) {
    console.error(error) 
  }  

  // free the Vosk runtime model
  freeModel(model)
}

main()
