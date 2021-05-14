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

  //if (process.argv.length > 2)
  //    audioFile = process.argv[2]

  vosk.setLogLevel(-1)

  const modelStart = new Date()
  const model = new vosk.Model(modelDirectory)
  const modelStop = new Date()


  const recognizerStart = new Date()
  const rec = new vosk.Recognizer({model: model, sampleRate: SAMPLE_RATE})
  const recognizerStop = new Date()

  const args = ffmpegtoPCMArgs(audioFile)
  console.log(`ffmpeg command          : ffmpeg ${args.join(' ')}`)

  const ffmpegStart = new Date()
  const ffmpegProcess = spawn('ffmpeg', args)

  let bufferDataItem = 1
  let pcmBuffer = Buffer.alloc(0) 

  ffmpegProcess.stdout.on('data', (stdout) => {

    console.log()
    console.log(`data item               : ${bufferDataItem++}`)
    console.log(`data size               : ${stdout.length}`)
    console.log(`ffmpeg latency          : ${new Date() - recognizerStop}ms`)
    
    pcmBuffer = Buffer.concat([pcmBuffer, stdout])
  })

  ffmpegProcess.on('close', async () => {

    //console.log(`isBuffer                : ${Buffer.isBuffer(pcmBuffer)}`)
    const ffmpegStop = new Date() 

    await rec.acceptWaveformAsync(pcmBuffer)
    const finalResult = rec.finalResult()

    console.log()
    console.log('final transcript        :')
    console.log(finalResult)
    console.log()
    console.log('LATENCIES:')
    console.log(`load model              : ${modelStop - modelStart}ms`)
    console.log(`recognizer              : ${recognizerStop - recognizerStart}ms`)
    console.log(`ffmpeg final            : ${ffmpegStop - ffmpegStart}ms`)
    console.log()
    console.log(`acceptWaveformAsync     : ${new Date() - ffmpegStop}ms`)

    rec.free()
    model.free()
  })

}

main()

