const { spawn } = require('child_process')
const vosk = require('vosk')

//  const modelDirectory = '../models/vosk-model-en-us-aspire-0.2'
const modelDirectory = '../models/vosk-model-small-en-us-0.15'
const audioFile = '../audio/2830-3980-0043.wav.webm'

console.log(`model directory         : ${modelDirectory}`)
console.log(`speech file name        : ${audioFile}`)

const SAMPLE_RATE = 16000
const BUFFER_SIZE = 4000

let latencyStart

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


//if (process.argv.length > 2)
//    audioFile = process.argv[2]

vosk.setLogLevel(-1)

latencyStart = new Date()
const model = new vosk.Model(modelDirectory)
console.log(`load model latency      : ${new Date() - latencyStart}ms`)


const rec = new vosk.Recognizer({model: model, sampleRate: SAMPLE_RATE})


latencyStart = new Date()

const args = ffmpegtoPCMArgs(audioFile)
console.log(`ffmpeg command          : ffmpeg ${args.join(' ')}`)

const ffmpegProcess = spawn('ffmpeg', args)

//let i = 1

ffmpegProcess.stdout.on('data', async (stdoutData) => {

  //console.log()
  //console.log(`data chunk              : ${i++}`)
  //console.log(`ffmpeg latency          : ${new Date() - latencyStart}ms`)
  
  //await rec.acceptWaveformAsync(stdoutData)
  rec.acceptWaveform(stdoutData)

  const partial = rec.partialResult()
  //console.log(`partial transcript      : ${partial}`)
  console.log('partial transcript:')
  console.log(partial)
  console.log(`partial latency         : ${new Date() - latencyStart}ms`)

})


ffmpegProcess.on('close', () => {

  console.log()
  console.log('final transcript        :')
  const finalResult = rec.finalResult()
  console.log(finalResult)
  console.log(`final latency           : ${new Date() - latencyStart}ms`)

 rec.free()
})


/*
async function main() { 
}
main()
*/
