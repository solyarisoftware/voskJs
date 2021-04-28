const { initModel, transcript, freeModel } = require('../voskjs')

async function main() {
  const modelDirectory = '../models/vosk-model-en-us-aspire-0.2'
  const audioFile = '../audio/2830-3980-0043.wav'

  console.log(`model directory         : ${modelDirectory}`)
  console.log(`speech file name        : ${audioFile}`)
  console.log()

  // create a Vosk runtime model
  const model = await initModel(modelDirectory)

  // speech recognition of an audio file
  try {
    console.log( await transcript(audioFile, model) )
  }  
  catch (error) {
    console.error(error) 
  }  

  // free the Vosk runtime model
  freeModel(model)
}

main()
