const os = require('os')
const { logLevel, loadModel, transcript, freeModel } = require('../voskjs')
const { setTimer, getTimer } = require('../lib/chronos')

const DEBUG_REQUESTS = false
const DEBUG_RESULTS = false
let activeRequests = 0

/** 
 * concurrentRequestsTest
 * run in parallel a number of transcript requests (for a given model and audio file)
 *
 * @async
 * @param {Number} numRequests
 * @param {String} audioFile
 * @param {VoskModelObject} model
 * @return {Promise}
 *
 */ 
function concurrentTranscriptRequests(numRequests, audioFile, model) {
  
  const promises = []

  for (let i = 0; i < numRequests; i++ ) {
    
    if (DEBUG_REQUESTS) {
      // new thread started, increment global counter of active thread running
      activeRequests++
      console.log ( `DEBUG. active requests : ${activeRequests}` )
    }  

    // speech recognition from an audio file
    try {
      // run an async function (returning a Promise), without waiting the end of transcript elaboration  
      const transcriptPromise = transcript(audioFile, model)
    
      // add Promise to an array
      promises.push(transcriptPromise)
    
    }  
    catch (error) {
      console.error(error) 
    }  

  }  

  // return an array of promises
  return promises
}


/**
 * stressTest
 * unit test
 */ 
async function main() {

  const numRequests = + process.argv[2]

  if ( !numRequests || numRequests < 1 ) {
    console.error(`usage: ${process.argv[1]} number_parallel_requests`)
    process.exit()
  }  

  // take the number of virtual cores (vCPU) 
  const cpuCount = os.cpus().length

  console.log()
  console.log(`CPU cores in this host : ${cpuCount}`) 

  if ( numRequests > cpuCount ) 
    console.log(`warning: number of requested tasks (${numRequests}) is higher than number of available cores (${cpuCount})`)

  console.log(`requests to be spawned : ${numRequests}`)
  console.log()

  const modelDirectory = '../models/vosk-model-en-us-aspire-0.2'
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

  // run numRequests transcript requests in parallel
  const promises = concurrentTranscriptRequests(numRequests, audioFile, model)
  // await singleTranscriptRequests(numRequests, audioFile, model)
  
  // wait termination of all promises
  for (let i = 0; i < promises.length; i++ ) {

    setTimer('transcript')
    const result = await promises[i]

    if (DEBUG_REQUESTS) {
      // thread finished, decrement global counter of active thread running
      activeRequests--
      console.log ( `DEBUG. active requests : ${activeRequests}` )
    }  

    console.log(`transcript latency     : ${getTimer('transcript')}ms`)

    if (DEBUG_RESULTS) 
      console.log( result )
      
  }

  // free the runtime model
  freeModel(model)
  
  //console.log('done.')

}  


main() 

