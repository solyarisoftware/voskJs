const vosk = require('vosk')

const fs = require('fs')
const { Readable } = require('stream')
const wav = require('wav')

let model

function init(modelDirectory) {

  vosk.setLogLevel(0)
  
  model = new vosk.Model(modelDirectory)

}  


function free() {

  model.free()

}  


async function transcript(fileName) {

  const rec = new vosk.Recognizer({model: model, sampleRate: 16000.0})

  const wfStream = fs.createReadStream(fileName, {'highWaterMark': 4096})
  const wfReader = new wav.Reader()

  wfStream.pipe(wfReader)
  wfReader.on('format', async ({ audioFormat, sampleRate, channels }) => {
      
    if (audioFormat != 1 || channels != 1) {
      throw new Error('Audio file must be WAV format mono PCM.')
    }

    for await (const data of new Readable().wrap(wfReader)) {

      const end_of_speech = rec.acceptWaveform(data)

      if (end_of_speech) {
        console.log(rec.result())
      }
    
    }

    console.log( rec.finalResult(rec) )
    return rec.finalResult(rec) 
    rec.free()

  })

}


/**
 * unit test main 
 */
async function main() {

  const modelDirectory = 'models/vosk-model-en-us-aspire-0.2'
  const fileName = 'audio/2830-3980-0043.wav'
  
  init(modelDirectory)

  try {
    const result = await transcript(fileName) 
    console.log(result)
  }  
  catch(error) {
    console.error(error) 
  }  

  free()

}


if (require.main === module) 
  main()

module.exports = { 
  init,
  transcript,
  free
}

