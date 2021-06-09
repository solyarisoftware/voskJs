const vosk = require('vosk')
const { toPCM } = require('../lib/audioutils')
const { spellingEnglishCharacters } = require('../examples/spellingEnglishCharacters')

// build a 'blended' grammar just for test
const grammar = spellingEnglishCharacters.concat([ 
  'experience proves this',
  'why should one hold on the way',
  'your power is sufficient i said',
  'oh one two three four five six seven eight nine zero',
  //'Giorgio Robino'
  '[unk]'
  ])

const SAMPLE_RATE = 16000

async function main() { 

  //  const modelDirectory = '../models/vosk-model-en-us-aspire-0.2'
  const modelDirectory = '../models/vosk-model-small-en-us-0.15'
  const sourceFile = '../audio/2830-3980-0043.wav.webm'

  console.log(`model directory         : ${modelDirectory}`)
  console.log(`speech file name        : ${sourceFile}`)
  console.log(`grammar                 : ${grammar}`)

  vosk.setLogLevel(-1)

  const modelStart = new Date()
  const model = new vosk.Model(modelDirectory)
  const modelStop = new Date()

  const recognizerStart = new Date()
  const rec = new vosk.Recognizer({model: model, sampleRate: SAMPLE_RATE, grammar})
  const recognizerStop = new Date()

  const ffmpegStart = new Date()
  const pcmBuffer = await toPCM({sourceFile})
  const ffmpegStop = new Date()

  const transcriptStart = new Date()
  await rec.acceptWaveformAsync(pcmBuffer)
  //rec.acceptWaveform(pcmBuffer)
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
  console.log(`acceptWavefromAsync     : ${transcriptStop - transcriptStart}ms`)
  console.log(`laten. from ffmpeg start: ${transcriptStop - ffmpegStart}ms`)

  rec.free()
  model.free()
}

main()

