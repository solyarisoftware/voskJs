const { loadModel, transcript, freeModel } = require('../voskjs')

async function main() {

  const modelDirectory = '../models/vosk-model-en-us-aspire-0.2'
  const audioFile = '../audio/2830-3980-0043.wav'

  console.log(`model directory         : ${modelDirectory}`)
  console.log(`speech file name        : ${audioFile}`)
  console.log()

  // load in memory a Vosk directory model
  const { model, latency } = await loadModel(modelDirectory)

  console.log(`init model latency   : ${latency}ms`)

  // speech recognition of an audio file
  try {
    const { result, latency } = await transcript(audioFile, model)

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
