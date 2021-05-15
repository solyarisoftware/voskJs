const { spawn } = require('child_process')
const vosk = require('vosk')

const SAMPLE_RATE = 16000
const BUFFER_SIZE = 4000

/**
 * ffmpegtoPCMArgs
 * set ffmpeg args to convert any source audio file to a PCM  
 * @function
 * 
 * @param {String} audioFile
 * @param {Number} sampleRate
 * @param {Number} bufferSize
 *
 */ 
const ffmpegtoPCMArgs = (audioFile, sampleRate=SAMPLE_RATE, bufferSize=BUFFER_SIZE) => [
  '-loglevel', 
  'quiet', 
  '-i', audioFile,
  '-ar', String(sampleRate), 
  '-ac', '1',
  '-f', 's16le', 
  '-bufsize', String(bufferSize), 
  '-'
]



async function main() { 

  //  const modelDirectory = '../models/vosk-model-en-us-aspire-0.2'
  const modelDirectory = '../models/vosk-model-small-en-us-0.15'
  const audioFile = '../audio/2830-3980-0043.wav.webm'

  console.log(`model directory         : ${modelDirectory}`)
  console.log(`speech file name        : ${audioFile}`)

  let latencyStart

  //if (process.argv.length > 2)
  //    audioFile = process.argv[2]

  vosk.setLogLevel(-1)

  latencyStart = new Date()
  const model = new vosk.Model(modelDirectory)
  console.log(`load model latency      : ${new Date() - latencyStart}ms`)

  const rec = new vosk.Recognizer({model: model, sampleRate: SAMPLE_RATE})

  const ffmpegStart = new Date()
  const args = ffmpegtoPCMArgs(audioFile)
  console.log(`ffmpeg command          : ffmpeg ${args.join(' ')}`)

  latencyStart = new Date()
  const ffmpegProcess = spawn('ffmpeg', args)

  //let i = 1

  for await (const data of ffmpegProcess.stdout) { 

    //console.log()
    //console.log(`data item               : ${i++}`)
    //console.log(`data size               : ${data.length}`)
    //console.log(`ffmpeg latency          : ${new Date() - latencyStart}ms`)

    await rec.acceptWaveformAsync(data)

    const partial = rec.partialResult()
    console.log('partial transcript:')
    console.log(partial)
    console.log(`partial latency         : ${new Date() - latencyStart}ms`)
  }

  console.log()
  console.log('final transcript        :')
  const finalResult = rec.finalResult()
  console.log(finalResult)
  console.log(`final latency           : ${new Date() - ffmpegStart}ms`)

  rec.free()

}

main()

