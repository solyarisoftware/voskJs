const { logLevel, loadModel, transcript, freeModel } = require('../voskjs')

/**
 * @see https://alphacephei.com/vosk/adaptation
 */ 
async function main() {

  // Note that big models with static graphs do not support this modification, 
  // you need a model with dynamic graph.
  //const modelDirectory = '../models/vosk-model-en-us-aspire-0.2'
  const modelDirectory = '../models/vosk-model-small-en-us-0.15'

  const audioFile = '../audio/2830-3980-0043.wav' // -> 'experience proves this'
  
  const grammar = [ 

    'experience proves this',
    'why should one hold on the way',
    'your power is sufficient i said',
    '[unk]',
    'oh one two three four five six seven eight nine zero',
    'Giorgio Robino'
  ]

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
