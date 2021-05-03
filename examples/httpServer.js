const http = require('http')
const path = require('path')

const { logLevel, loadModel, transcript, freeModel } = require('../voskjs')
const { getArgs } = require('../lib/getArgs')

const HTTP_METHOD = 'POST' 
const HTTP_PATH = '/transcript'
const HTTP_PORT = 3000

/**
 * Module global variables
 */
let debug
let activeRequests = 0
let model
let modelName

function unixTimeMsecs() {
  return Math.floor(Date.now())
}  

function header(programName) {
  return [ 
  `${programName} is a simple HTTP JSON server, loading a Vosk engine model`,
  'to transcript speech files specified in HTTP POST /transcript request body client calls'
  ]  
}


function helpAndExit(programName) {
  
  console.info()
  for (const line of header(programName))
    console.log(line)

  console.info()
  console.info('Usage:')
  console.info()
  console.info(`    ${programName} --model=<model directory path> \\ `)
  console.info('                  [--port=<port number> \\')
  console.info('                  [--debug[=<vosk log level>]]')
  console.info()    
  console.info('Server settings examples:')
  console.info()    
  console.info('    stdout inludes httpServer internal debug logs and Vosk debug logs (log level 2)')
  console.info(`    node ${programName} --model=../models/vosk-model-en-us-aspire-0.2 --port=8086 --debug=2`)
  console.info()    
  console.info('    stdout includes httpServer internal debug logs without Vosk debug logs (log level -1)')
  console.info(`    node ${programName} --model=../models/vosk-model-en-us-aspire-0.2 --port=8086 --debug`)
  console.info()    
  console.info('    stdout includes minimal info, just request and response messages')
  console.info(`    node ${programName} --model=../models/vosk-model-en-us-aspire-0.2 --port=8086`)
  console.info()    
  console.info('    stdout includes minimal info, default port number is 3000')
  console.info(`    node ${programName} --model=../models/vosk-model-small-en-us-0.15`)
  console.info()
  console.info('Client requests examples:')
  console.info()
  console.info('    request body includes attributes: id, speech, model')
  console.info('    curl -s \\ ')
  console.info('         -X POST \\ ')
  console.info('         -H "Content-Type: application/json" \\ ')
  console.info('         -d \'{"id":"1620060067830","speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}\' \\ ')
  console.info('         http://localhost:3000/transcript')
  console.info()
  console.info('    request body includes attributes: speech, model')
  console.info('    curl -s \\ ')
  console.info('         -X POST \\ ')
  console.info('         -H "Content-Type: application/json" \\ ')
  console.info('         -d \'{"speech":"../audio/2830-3980-0043.wav","model":"vosk-model-en-us-aspire-0.2"}\' \\ ')
  console.info('         http://localhost:3000/transcript')
  console.info()    
  console.info()    
  console.info('    request body includes just the speech attribute')
  console.info('    curl -s \\ ')
  console.info('         -X POST \\ ')
  console.info('         -H "Content-Type: application/json" \\ ')
  console.info('         -d \'{"speech":"../audio/2830-3980-0043.wav"}\' \\ ')
  console.info('         http://localhost:3000/transcript')
  console.info()    

  process.exit(1)

}  


/**
 * validateArgs
 * command line parsing
 *
 * @param {String}                    args
 * @param {String}                    programName
 *
 * @returns {SentenceAndAttributes}
 * @typedef {Object} SentenceAndAttributes
 * @property {String} language 
 * 
 */
function validateArgs(args, programName) {


  // model is a cli mandatory argument
  const modelDirectory = args.model 

  if ( !modelDirectory ) 
    helpAndExit(programName)
  
  // if not set, port cli argument has a default
  const port = !args.port ? HTTP_PORT : args.port 

  // debug cli argument must be an integer or a boolean
  const debugLevel = args.debug

  return { modelDirectory, port, debugLevel }
}


/**
 * log
 *
 * @param {String} text
 * @param {String} type
 * @return {Number} timestamp
 *
 */
function log(text, type) {

  const time = unixTimeMsecs()

  if (type)
    console.log(`${time} ${type} ${text}`)
  else
    console.log(`${time} ${text}`)

  return time

}


/**
 * errorResponse
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */ 
function errorResponse(message, statusCode, res) {
  res.statusCode = statusCode
  res.end(`{"error":"${message}"}`)
  log(message, 'ERROR')
}

function successResponse(requestId, json, res) {
  log(`response ${requestId} ${json}`)
  res.end(json)
}


function requestListener(req, res) {
  
  // This function is called once the headers have been received
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== HTTP_METHOD) 
    return errorResponse(`method not allowed ${req.method}`, 405, res)

  if (req.url !== HTTP_PATH)
    return errorResponse(`path not allowed ${req.url}`, 405, res)

  let body = ''

  // This function is called as chunks of body are received
  req.on('data', (data) => { body += data })

  // This function is called once the body has been fully received
  req.on('end', async () => {

    let parsedBody

    try {
      parsedBody = JSON.parse(body)
    }
    catch (error) {
      return errorResponse(`id ${requestId} cannot parse request body ${error}`, 400, res)
    }

    // log request body  
    const currentTime = log(`request ${body}`)
    
    // set requestId to the id attribute of the request body, 
    // if id attribute is not present in the request body, 
    // set the requestId with current timestamp in msecs.
    const requestId = parsedBody.id ? parsedBody.id : currentTime 

    // validate body data

    // body must have attributes "speech" and "model"
    if ( !parsedBody.speech ) 
      return errorResponse(`id ${requestId} speech attribute not found in the body request`, 405, res)

    // body attribute "model" is specified in the client request,
    // it must be equal to the model name loaded by the server
    if ( parsedBody.model && (parsedBody.model !== modelName) ) 
      return errorResponse(`id ${requestId} Vosk model ${parsedBody.model} unknown`, 404, res)

    try {

      if (debug) {
        // new thread started, increment global counter of active thread running
        activeRequests++
        log(`active requests ${activeRequests}`, 'debug')
      }

      // speech recognition of an audio file
      const transcriptData = await transcript(parsedBody.speech, model)

      if (debug) {
        // thread finished, decrement global counter of active thread running
        activeRequests--
        log(`active requests ${activeRequests}`, 'debug')
      }  

      const latency = transcriptData.latency
      
      // return JSON data structure
      const json = JSON.stringify({
        ... { request: parsedBody },
        ... { id: requestId },
        ... { latency },
        ... transcriptData.result 
        })

      if (debug)
        log(`latency ${requestId} ${latency}ms`, 'debug')
      
      return successResponse(requestId, json, res)

    }  
    catch (error) {
      return errorResponse(`id ${requestId} transcript function ${error}`, 415, res)
    }  

  })
}  


function shutdown(signal) {

  log(`${signal} received`)
  
  // free the Vosk runtime model
  freeModel(model)
  
  log('Shutdown done')
  
  process.exit(0)
}  


async function main() {

  let voskLogLevel

  // get command line arguments 
  const { args } = getArgs()
  
  const programName = path.basename(__filename, '.js')

  const { modelDirectory, port, debugLevel } = validateArgs(args, programName )

  // set modelName as a global variable
  modelName = path.basename(modelDirectory, '/')

  // debug cli argument not set, 
  // internal httpServer debug and Vosk log level are unset
  if ( ! debugLevel ) { 
    debug = false
    voskLogLevel = -1
    logLevel(voskLogLevel) 
  }  
  
  // internal httpServer debug is set but Vosk log level is unset
  else if ( debugLevel === true ) {
    debug = true
    voskLogLevel = -1
    logLevel(voskLogLevel) 
  }

  // debug cli argument s an integer,
  // internal debug is set and Vosk log level is set to corresponding value
  else if ( Number.isInteger(+debugLevel) ) {
    debug = true
    voskLogLevel = +debugLevel
    logLevel(voskLogLevel) 
  }

  //for (const line of header(programName))
  // log(line)

  log(`Model path: ${modelDirectory}`)
  log(`Model name: ${modelName}`)
  log(`HTTP server port: ${port}`)
  log(`internal debug log: ${debug}`)
  log(`Vosk log level: ${voskLogLevel}`)

  let latency

  log(`wait loading Vosk model: ${modelName} (be patient)`);

  // create a Vosk runtime model
  ( { model, latency } = await loadModel(modelDirectory) );

  log(`Vosk model loaded in ${latency} msecs`)

  // create the HTTP server instance
  const server = http.createServer( (req, res) => requestListener(req, res) )

  // listen incoming client requests
  server.listen( port, () => {
    log(`server ${path.basename(__filename)} running at http://localhost:${port}`)
    log(`endpoint http://localhost:${port}${HTTP_PATH}`)
    log('press Ctrl-C to shutdown')
    log('ready to listen incoming requests')
  })
  
  // shutdown management
  process.on('SIGTERM', shutdown )
  process.on('SIGINT', shutdown )

  //
  // Shutdown on uncaughtException 
  // https://flaviocopes.com/node-exceptions/
  //
  process.on('uncaughtException', (err) => { 
      log(`there was an uncaught error: ${err}`, 'FATAL')
      shutdown('uncaughtException')
  })
  

}

main()

