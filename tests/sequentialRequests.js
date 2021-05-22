const { logLevel, loadModel, transcript, freeModel } = require('../voskjs')
const { setTimer, getTimer } = require('../lib/chronos')

const DEBUG_REQUESTS = true
const DEBUG_RESULTS = false

/** 
 * sequentialRequestsTest
 * run sequentially a number of transcript requests (for a given model and audio file)
 *
 * @async
 * @param {Number} numRequests
 * @param {String} audioFile
 * @param {VoskModelObject} model
 * @return {Promise}
 *
 */ 
async function sequentialTranscriptRequests(numRequests, audioFile, model) {
  
  for (let i = 0; i < numRequests; i++ ) {
    
    if (DEBUG_REQUESTS) 
      console.log(`request nr.            : ${i+1}`)

    // speech recognition from an audio file
    try {
    
      setTimer('transcript')
      const result = await transcript(audioFile, model, {multiThreads:true})

      console.log(`transcript latency     : ${getTimer('transcript')}ms`)

      if (DEBUG_RESULTS) 
        console.log( result )
    
    }  
    catch (error) {
      console.error(error) 
    }  

  }  

}


async function main() {

  const numRequests = + process.argv[2]

  if ( !numRequests || numRequests < 1 ) {
    console.error(`usage: ${process.argv[1]} number_sequential_requests`)
    process.exit()
  }  

  console.log(`requests               : ${numRequests}`)
  console.log()

  //const modelDirectory = '../models/vosk-model-en-us-aspire-0.2'
  const modelDirectory = '../models/vosk-model-small-en-us-0.15'
  const audioFile = '../audio/2830-3980-0043.wav'

  console.log(`model directory        : ${modelDirectory}`)
  console.log(`speech file name       : ${audioFile}`)
  console.log()

  // set the vosk log level to silence 
  logLevel(-1) 

  setTimer('loadModel')

  // create a runtime model
  const model = loadModel(modelDirectory)

  console.log(`load model latency     : ${getTimer('loadModel')}ms`)
  console.log()

  // run numRequests transcript requests sequentially
  await sequentialTranscriptRequests(numRequests, audioFile, model)
  
  // free the runtime model
  freeModel(model)
  
  //console.log('done.')

}  


main() 

