const vosk = require('vosk')
const { toPCMBuffer } = require('../lib/toPCMBuffer')

const SAMPLE_RATE = 16000

async function main() { 

  //  const modelDirectory = '../models/vosk-model-en-us-aspire-0.2'
  const modelDirectory = '../models/vosk-model-small-en-us-0.15'
  const sourceFile = '../audio/2830-3980-0043.wav.webm'

  console.log(`model directory         : ${modelDirectory}`)
  console.log(`speech file name        : ${sourceFile}`)

  vosk.setLogLevel(-1)

  const modelStart = new Date()
  const model = new vosk.Model(modelDirectory)
  const modelStop = new Date()

  const recognizerStart = new Date()
  const rec = new vosk.Recognizer({model: model, sampleRate: SAMPLE_RATE})
  const recognizerStop = new Date()

  const ffmpegStart = new Date()
  const pcmBuffer = await toPCMBuffer({sourceFile})
  const ffmpegStop = new Date()

  const transcriptStart = new Date()
  await rec.acceptWaveformAsync(pcmBuffer)
  const finalResult = rec.finalResult()
  const transcriptStop = new Date()

  console.log()
  console.log('final transcript        :')
  console.log(finalResult)
  console.log()
  console.log('LATENCIES:')
  console.log(`load model              : ${modelStop - modelStart}ms`)
  console.log(`recognizer              : ${recognizerStop - recognizerStart}ms`)
  console.log(`ffmpeg to PCM           : ${ffmpegStop - ffmpegStart}ms`)
  console.log(`acceptWaveformAsync     : ${transcriptStop - transcriptStart}ms`)
  console.log(`final latency           : ${transcriptStop - ffmpegStart}ms`)

  rec.free()
  model.free()
}

main()

