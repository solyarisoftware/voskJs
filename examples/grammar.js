const util = require('util')
const { logLevel, loadModel, transcriptFromFile, freeModel } = require('../voskjs')
const { setTimer, getTimer } = require('../lib/chronos')

/**
 * @see https://alphacephei.com/vosk/adaptation
 */ 
async function main() {

  // Note that big models with static graphs do not support this modification, 
  // you need a model with dynamic graph.
  //const modelDirectory = '../models/vosk-model-en-us-aspire-0.2'
  const modelDirectory = '../models/vosk-model-small-en-us-0.15'

  const audioFile = '../audio/2830-3980-0043.wav' // -> experience proves this
  //const audioFile = '../audio/4507-16021-0012.wav' // -> why should one hold on the way
  //const audioFile = '../audio/8455-210777-0068.wav' // -> your power is sufficient i said
  
  const grammar = [ 

    'experience proves this',
    'why should one hold on the way',
    'your power is sufficient i said',
    'oh one two three four five six seven eight nine zero',
    //'Giorgio Robino'
    '[unk]'
  ]

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

    // configuration parameters specify a grammar, 3 alternatives and each word detail
    const result = await transcriptFromFile(audioFile, model, {grammar, alternatives:3, words:true} )

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
