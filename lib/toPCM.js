const { readFileSync } = require('fs')
const { spawn } = require('child_process')

const SAMPLE_RATE = 16000
const BUFFER_SIZE = 4000

/**
 * toPCMFfmpegArgs
 * set ffmpeg args to convert any source audio file to a PCM file 
 *
 * @function
 * 
 * @param {String} sourceFile. Default value: pipe:0 means stdin
 * @param {String} destinationFile. Default value: pipe:1 means stdout
 * @see https://stackoverflow.com/questions/45899585/pipe-input-in-to-ffmpeg-stdin
 * @see https://ffmpeg.org/ffmpeg-protocols.html#pipe
 *
 * @param {Number} sampleRate. Default value: SAMPLE_RATE
 * @param {Number} bufferSize. Default value: BUFFER_SIZE
 *
 * @return {String[]} array containing the list of arguments for ffmpeg cli program
 */ 
const toPCMffmpegArgs = ({sourceFile='pipe:0', destinationFile='pipe:1', sampleRate=SAMPLE_RATE, bufferSize=BUFFER_SIZE} = {}) => [
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
 * transcode 
 * from an input file or an input Buffer
 * to a PCM audio buffer 
 *
 * @function
 * @async
 *
 * @param  {ToPCMBufferObject}          args
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

    const ffmpegArgsToPCM = [
      '-loglevel', 
      'quiet', 
      '-i', sourceFile,
      '-ar', String(sampleRate), 
      '-ac', '1',
      '-f', 's16le', 
      '-bufsize', String(bufferSize), 
      destinationFile
    ]

    try { 
      ffmpeg = spawn('ffmpeg', ffmpegArgsToPCM)
    }
    catch (error) {
       return reject(`ffmpeg spawn error: ${error}`) 
    }

    console.log(`ffmpeg command          : ffmpeg ${ffmpegArgsToPCM.join(' ')}`)

    /**
     * if the source Buffer is specified, write it into ffmpeg process stdin
     * avoiding to pass through the disk 
     *
     * https://stackoverflow.com/questions/30937751/pass-a-buffer-to-a-node-js-child-process
     * https://stackoverflow.com/questions/30943250/pass-buffer-to-childprocess-node-js?noredirect=1&lq=1
     */
    if (sourceBuffer) {
      //console.log(sourceBuffer)
      ffmpeg.stdin.end(sourceBuffer)
    }  

    //let bufferDataItem = 1
    
    // allocate a buffer to contain PCM data collected from stdout
    let buffer = Buffer.alloc(0) 

    ffmpeg.stdout.on('data', (stdout) => {

      //console.log()
      //console.log(`data item               : ${bufferDataItem++}`)
      //console.log(`data size               : ${stdout.length}`)
      //console.log(`ffmpeg item latency     : ${new Date() - ffmpegStart}ms`)
      
      buffer = Buffer.concat([buffer, stdout])
    })

    //console.log(`isBuffer                : ${Buffer.isBuffer(buffer)}`)
    ffmpeg.on('close', () => resolve(buffer))
  })
}  


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
  console.log('TEST 2: input Buffer (any audio format), output Buffer (PCM format)')
  
  const readFileSyncStart = new Date()

  const sourceBuffer = readFileSync(sourceFile)
  
  const readFileSyncStop = new Date()
  console.log(`readFileSync            : ${readFileSyncStop - readFileSyncStart}ms`)
  
  const toPCMStart = new Date()

  const destinationBuffer = await toPCM( { sourceFile /*, sourceBuffer*/ } )

  const toPCMStop = new Date()
  console.log(`toPCM                   : ${toPCMStop - toPCMStart}ms`)

  console.log(destinationBuffer)
  
}  


if (require.main === module)
  main()

module.exports = { 
  toPCMffmpegArgs,
  toPCM
}

