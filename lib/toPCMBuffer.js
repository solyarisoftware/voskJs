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
const toPCMFfmpegArgs = ({sourceFile='pipe:0', destinationFile='pipe:1', sampleRate=SAMPLE_RATE, bufferSize=BUFFER_SIZE} = {}) => [
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
 * toPCMBuffer
 * transcrode an input (or pipe) file to a PCM audio buffer
 *
 * @function
 * @async
 *
 * @param  {Object}          args
 * @return {Promise<Buffer>}      
 *
 * @example 
 *   ffmpeg( {sourceFile} )
 *
 */

function toPCMBuffer(args) {
  return new Promise( (resolve, reject) => {

    //const ffmpegStart = new Date()

    // ffmpeg destination file is set by default to stdout!
    const argsArray = toPCMFfmpegArgs(args)

    let ffmpeg

    try { 
      ffmpeg = spawn('ffmpeg', argsArray)
    }
    catch (error) {
       reject(`ffmpeg spawn error: ${error}`) 
    }

    console.log(`ffmpeg command          : ffmpeg ${argsArray.join(' ')}`)

    //let bufferDataItem = 1
    let pcmBuffer = Buffer.alloc(0) 

    ffmpeg.stdout.on('data', (stdout) => {

      //console.log()
      //console.log(`data item               : ${bufferDataItem++}`)
      //console.log(`data size               : ${stdout.length}`)
      //console.log(`ffmpeg item latency     : ${new Date() - ffmpegStart}ms`)
      
      pcmBuffer = Buffer.concat([pcmBuffer, stdout])
    })

    //console.log(`isBuffer                : ${Buffer.isBuffer(pcmBuffer)}`)
    ffmpeg.on('close', () => resolve(pcmBuffer))
  })
}  


// test
if (require.main === module) {

  const sourceFile = 'audio/2830-3980-0043.webm'

  const args = toPCMFfmpegArgs({sourceFile})

  console.log(`ffmpeg command arguments: ffmpeg ${args.join(' ')}`)
}  


module.exports = { 
  toPCMFfmpegArgs,
  toPCMBuffer
}

