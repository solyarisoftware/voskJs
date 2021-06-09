const fs = require('fs')
const { spawn } = require('child_process')

const SAMPLE_RATE = 16000
const BUFFER_SIZE = 4000


/**
 * ffmpegArgsToPCM
 * set ffmpeg args to convert any source audio file/buffer to a PCM file/buffer
 *
 * @function
 * 
 * @param {String} sourceFile
 * @param {String} destinationFile
 *
 * @see https://stackoverflow.com/questions/45899585/pipe-input-in-to-ffmpeg-stdin
 * @see https://ffmpeg.org/ffmpeg-protocols.html#pipe
 *
 * @param {Number} sampleRate
 * @param {Number} bufferSize
 *
 * @return {String[]} array containing the list of arguments for ffmpeg cli program
 */ 
const ffmpegArgsToPCM = (sourceFile, sampleRate, bufferSize, destinationFile) => [
  '-loglevel', 
  'quiet', 
  '-i', sourceFile,
  '-ar', String(sampleRate), 
  '-ac', '1',
  '-f', 's16le', 
  '-bufsize', String(bufferSize), 
  destinationFile
]


/**
 * toPCM
 *
 * @function
 * @async
 * @requires ffmpeg installed in your host 
 *
 * transcode (file or buffer) audio 
 * from an input file or an input Buffer to a PCM audio buffer
 * spawning an external ffmpeg process.
 *
 * Input buffer is passed to ffmpeg child process, piping stream trough stdin 
 * Output buffer is piped by ffmpeg child process, piping stream to stdout
 * This way, using stdin/stdout I/O you skip disk I/O, avoiding filesystem!
 *
 * @typedef  {ToPCMObject}
 * @property {String}      sourceFile. pipe:0 means stdin
 * @property {String}      destinationFile. pipe:1 means stdout
 * @property {Number}      sampleRate
 * @property {Number}      bufferSize
 *
 * @param  {ToPCMObject}         ToPCMBufferObject  
 * @return {Promise<Buffer>}      
 *
 * @example 
 *   // 1. from an input Buffer to an output Buffer
 *   const sourceBuffer = ...
 *   toPCM( {sourceBuffer} )
 *
 *   // 2. from an input Buffer to an output file
 *   const destinationFile = 'file.webm.wav'
 *   toPCM( {sourceBuffer, destinationFile} )
 *
 *   // 3. from an input file to an output Buffer
 *   const sourceFile = "file.webm"
 *   toPCM( {sourceFile} )
 *
 *   // 4. from an input file to an output file 
 *   const sourceFile = "file.webm"
 *   toPCM( {sourceFile, destinationFile} )
 *
 */
function toPCM({sourceBuffer=undefined, sourceFile='pipe:0', destinationFile='pipe:1', sampleRate=SAMPLE_RATE, bufferSize=BUFFER_SIZE} = {}) {
  return new Promise( (resolve, reject) => {

    //const ffmpegStart = new Date()

    let ffmpeg

    try { 
      ffmpeg = spawn('ffmpeg', ffmpegArgsToPCM(sourceFile, sampleRate, bufferSize, destinationFile))
    }
    catch (error) {
       return reject(`ffmpeg spawn error: ${error}`) 
    }

    //console.log(`ffmpeg command          : ffmpeg ${ffmpegArgsToPCM.join(' ')}`)

    /**
     * if the source Buffer is specified, write it into ffmpeg process stdin avoiding disk I/O. 
     *
     * @see
     * https://stackoverflow.com/questions/30937751/pass-a-buffer-to-a-node-js-child-process
     * https://stackoverflow.com/questions/30943250/pass-buffer-to-childprocess-node-js?noredirect=1&lq=1
     */
    if (sourceBuffer)
      ffmpeg.stdin.end(sourceBuffer)
     

    //let bufferDataItem = 1
    
    // allocate a buffer to contain PCM data collected from stdout
    let buffer = Buffer.alloc(0) 

    ffmpeg.stdout.on('data', (stdout) => {
      
      buffer = Buffer.concat([buffer, stdout])

      //console.log()
      //console.log(`data item               : ${bufferDataItem++}`)
      //console.log(`data size               : ${stdout.length}`)
      //console.log(`ffmpeg item latency     : ${new Date() - ffmpegStart}ms`)
    })

    ffmpeg.on('close', () => resolve(buffer))
  })
}  


/**
 * audio duration in seconds (of a pcm buffer)
 *
 * @function
 * @public
 *
 * @see https://stackoverflow.com/questions/62553574/calculate-duration-of-arraybuffer-without-audio-api
 *
 * @param {Buffer} arrayBuffer
 * @param {Number} numChannels
 * @param {Number} sampleRate
 * @param {Number} bytesPerSample
 *
 * @return {Number} duration in seconds
 *
 */ 
function duration(arrayBuffer, numChannels=1, sampleRate=16000, bytesPerSample=2) {

  // total samples/frames
  const totalSamples = arrayBuffer.byteLength / bytesPerSample / numChannels

  // total seconds
  return totalSamples / sampleRate
}



/**
 * Real-Time Factor
 * Real-Time Factor (RTF) is defined as processing-time / length-of-audio. 
 * The exact real-time factor of an STT model will depend on the hardware setup, so you may experience a different RTF.
 *
 * @param {Number}  processingTime (secs)
 * @param {Number}  audioLength    (secs)
 * @param {Number}  decimals       number of decimals precision  
 * @return {Number} calculated value as floating number 
 */
const rtf = (processingTime, audioLenght, decimals=2) =>
  +((processingTime / audioLenght).toFixed(decimals))


/**
 * aproxKiloBytes
 * pretty print an audio length in KB 
 * 
 * @function
 * @public
 *
 * @param {Number}  duration
 * @return {String}
 *
 * @example
 *   aproxKiloBytes(63345) // => '63345~63Kb'
 *
 */ 
const aproxKiloBytes = (bytes) => 
  `${bytes}~${Math.round(bytes / 1024)}K`


/**
 * aproxSecs
 * pretty print an audio duration in seconds
 * 
 * @function
 * @public
 *
 * @param {Number}  duration
 * @return {String}
 *
 * @example
 *   msecsSecs(1.23445678) // => '1234ms~1s'
 *
 */ 
const aproxSecs = (duration) => 
  `${Math.round(duration*1000)}ms~${Math.round(duration)}s`


const byteLength = (buffer) => 
  buffer.byteLength


// test
async function main() {

  const sourceFile = '../audio/2830-3980-0043.wav.webm'

  /*
  console.log()
  console.log('TEST 1: ffmpeg arguments for PCM output ')

  const args = toPCMffmpegArgs({sourceFile})
  
  console.log(`ffmpeg command arguments: ffmpeg ${args.join(' ')}`)
  */

  console.log()
  console.log('TEST: input Buffer (any audio format), output Buffer (PCM format)')
  console.log('-----------------------------------------------------------------')
  
  const readFileSyncStart = new Date()

  // https://nodejs.org/api/fs.html#fs_file_system_flags
  const sourceBuffer = fs.readFileSync(sourceFile, { flag: 'rs+' } )
  
  const readFileSyncStop = new Date()
  console.log(`source file                  : ${sourceFile}`)
  console.log(`readFileSync latency         : ${readFileSyncStop - readFileSyncStart}ms`)
  
  const toPCMStart = new Date()

  const destinationBuffer = await toPCM( { sourceFile /*, sourceBuffer*/ } )

  const toPCMStop = new Date()

  const latencyMsecs = toPCMStop - toPCMStart

  const bufferLenght = byteLength(destinationBuffer)
  const durationSecs = duration(destinationBuffer)
  const durationMsecs = durationSecs*1000
  const realtimeFactor = rtf(latencyMsecs, durationMsecs)

  console.log(`toPCM latency                : ${latencyMsecs}ms`)
  console.log(`audio PCM buffer length      : ${aproxKiloBytes(bufferLenght)}`)
  console.log(`audio duration               : ${aproxSecs(durationSecs)}`)
  console.log(`audio real time factor (RTF) : ${realtimeFactor}`)
  
}  


if (require.main === module)
  main()

module.exports = { 
  duration,
  aproxSecs,
  aproxKiloBytes,
  byteLength,
  rtf,
  toPCM
}

