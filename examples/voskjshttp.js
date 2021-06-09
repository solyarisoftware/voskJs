#!/usr/bin/env node

const path = require('path')
const http = require('http')
const url = require('url')

const { logLevel, loadModel, transcriptFromFile, transcriptFromBuffer, freeModel } = require('../voskjs')
const { getArgs } = require('../lib/getArgs')
const { setTimer, getTimer } = require('../lib/chronos')
const { info } = require('../lib/info')
const { log } = require('../lib/log')

//const HTTP_METHOD = 'GET' 
const HTTP_PATH = '/transcript'
const HTTP_PORT = 3000


/**
 * Module global variables
 */
let debug
let activeRequests = 0
let model
let modelName
let pathRegexp
let multiThreads


function unixTimeMsecs() {
  return Math.floor(Date.now())
}  


function helpAndExit(programName) {
  
  console.log('Simple demo HTTP JSON server, loading a Vosk engine model to transcript speeches.')
  console.log( info() )
  console.log()
  console.log('The server has two endpoints:')
  console.log()
  console.log('  HTTP GET /transcript')
  console.log('  The request query string arguments contain parameters,')
  console.log('  including a WAV file name already accessible by the server.')
  console.log()
  console.log('  HTTP POST /transcript')
  console.log('  The request query string arguments contain parameters,')
  console.log('  the request body contains the WAV file name to be submitted to the server.')
  console.log()
  console.log('Usage:')
  console.log()
  console.log(`  ${programName} --model=<model directory path> \\ `)
  console.log(`                [--port=<server port number. Default: ${HTTP_PORT}>] \\ `)
  console.log(`                [--path=<server endpoint path. Default: ${HTTP_PATH}>] \\ `)
  console.log('                [--no-threads]')
  console.log('                [--debug[=<vosk log level>]]')
  console.log()    
  console.log('Server settings examples:')
  console.log()    
  console.log(`  ${programName} --model=../models/vosk-model-en-us-aspire-0.2 --port=8086 --debug=2`)
  console.log('  # stdout includes the server internal debug logs and Vosk debug logs (log level 2)')
  console.log()    
  console.log(`  ${programName} --model=../models/vosk-model-en-us-aspire-0.2 --port=8086 --debug`)
  console.log('  # stdout includes the server internal debug logs without Vosk debug logs (log level -1)')
  console.log()    
  console.log(`  ${programName} --model=../models/vosk-model-en-us-aspire-0.2 --port=8086`)
  console.log('  # stdout includes minimal info, just request and response messages')
  console.log()    
  console.log(`  ${programName} --model=../models/vosk-model-small-en-us-0.15`)
  console.log('  # stdout includes minimal info, default port number is 3000')
  console.log()
  console.log('Client requests examples:')
  console.log()
  console.log('  1. GET /transcript - query string includes just the speech file argument')
  console.log()    
  console.log('  curl -s \\ ')
  console.log('       -X GET \\ ')
  console.log('       -H "Accept: application/json" \\ ')
  console.log('       -G \\ ')
  console.log('       --data-urlencode speech="../audio/2830-3980-0043.wav" \\ ')
  console.log('       http://localhost:3000/transcript')
  console.log()    
  console.log('  2. GET /transcript - query string includes arguments: speech, model')
  console.log()  
  console.log('  curl -s \\ ')
  console.log('       -X GET \\ ')
  console.log('       -H "Accept: application/json" \\ ')
  console.log('       -G \\ ')
  console.log('       --data-urlencode speech="../audio/2830-3980-0043.wav" \\ ')
  console.log('       --data-urlencode model="vosk-model-en-us-aspire-0.2" \\ ')
  console.log('       http://localhost:3000/transcript')
  console.log()    
  console.log('  3. GET /transcript - query string includes arguments: id, speech, model')
  console.log()    
  console.log('  curl -s \\ ')
  console.log('       -X GET \\ ')
  console.log('       -H "Accept: application/json" \\ ')
  console.log('       -G \\ ')
  console.log('       --data-urlencode id="1620060067830" \\ ')
  console.log('       --data-urlencode speech="../audio/2830-3980-0043.wav" \\ ')
  console.log('       --data-urlencode model="vosk-model-en-us-aspire-0.2" \\ ')
  console.log('       http://localhost:3000/transcript')
  console.log()
  console.log('  4. GET /transcript - includes arguments: id, speech, model, grammar')
  console.log()    
  console.log('  curl -s \\ ')
  console.log('       -X GET \\ ')
  console.log('       -H "Accept: application/json" \\ ')
  console.log('       -G \\ ')
  console.log('       --data-urlencode id="1620060067830" \\ ')
  console.log('       --data-urlencode speech="../audio/2830-3980-0043.wav" \\ ')
  console.log('       --data-urlencode model="vosk-model-en-us-aspire-0.2" \\ ')
  console.log('       --data-urlencode grammar="["experience proves this"]" \\ ')
  console.log('       http://localhost:3000/transcript')
  console.log()
  console.log('  5. POST /transcript - body includes the speech file')
  console.log()    
  console.log('  curl -s \\ ')
  console.log('       -X POST \\ ')
  console.log('       -H "Accept: application/json" \\ ')
  console.log('       -H "Content-Type: audio/wav" \\ ')
  console.log('       --data-binary="@../audio/2830-3980-0043.wav" \\ ')
  console.log('       "http://localhost:3000/transcript?id=1620060067830&model=vosk-model-en-us-aspire-0.2"')
  console.log()    

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
  
  const serverPort = !args.port ? HTTP_PORT : args.port 

  const serverPath = !args.path ? HTTP_PATH : args.path 

  const multiThreads = args['no-threads'] ? false: true

  // debug cli argument must be an integer or a boolean
  const debugLevel = args.debug

  return { modelDirectory, serverPort, serverPath, multiThreads, debugLevel }
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


// return JSON data structure
function responseJson(id, latency, result, res) {
  res.setHeader('Content-Type', 'application/json')
  return JSON.stringify({
    //... { request: JSON.stringify(queryObject) },
    ... { id },
    ... { latency },
    ... { vosk: result } 
    })
}  


function responseText(result, res) {
  res.setHeader('Content-Type', 'text/plain')
  return result.text 
}  


function successResponse(requestId, json, res) {
  log(`response ${requestId} ${json}`)
  res.end(json)
}

async function requestListener(req, res) {

  //if ( !req.url.match(/^\/transcript/) )
  if ( !req.url.match(pathRegexp) )
    return errorResponse(`path not allowed ${req.url}`, 405, res)

  //
  // if request header accept attribute is 'text/plain'
  // response body is text, otherwise
  // response body is 'application/json'
  //
  const requestAcceptText = (req.headers.accept === 'text/plain') ? true : false

  // HTTP GET /transcript
  if (req.method === 'GET') { 

    // get request query string arguments
    // https://nodejs.org/en/knowledge/HTTP/clients/how-to-access-query-string-parameters/
    const queryObject = url.parse(req.url,true).query
    
    const requestedModelName = queryObject.model 
    const requestedFilename = queryObject.speech 
    const requestedGrammar = queryObject.grammar 
    const requestedId = queryObject.id 
  
    // set id to the is query string argument 
    // if id argument is not present in the quesy string, 
    // set the id with current timestamp in msecs.
    const currentTime = unixTimeMsecs()
    const id = requestedId ? requestedId : currentTime

    // log request  
    log(`request GET ${id} ${requestedFilename} ${requestedModelName? requestedModelName : ''} ${requestedGrammar? requestedGrammar : ''}`, null, currentTime)

    // validate query string arguments 

    // body must have attributes "speech" and "model"
    if ( !requestedFilename ) 
      return errorResponse(`id ${id} "speech" attribute not found in the body request`, 405, res)

    // if query argument "model" is specified in the client request,
    // it must be equal to the model name loaded by the server
    if ( requestedModelName && (requestedModelName !== modelName) ) 
      return errorResponse(`id ${id} Vosk model ${model} unknown`, 404, res)

    return responseTranscriptGet(id, requestedFilename, requestedModelName, requestedGrammar, requestAcceptText, res)
  }

  // HTTP POST /transcript
  if (req.method === 'POST') {
    
    // get request headers attribute: "content-type" 
    const { 'content-type': contentType } = req.headers

    if (debug)
      log(`request POST content type ${contentType}`, 'DEBUG')

    // get request query string arguments
    const queryObject = url.parse(req.url,true).query

    const requestedModelName = queryObject.model 
    const requestedGrammar = queryObject.grammar 
    const requestedId = queryObject.id 
  
    // set id to the is query string argument 
    // if id argument is not present in the quesy string, 
    // set the id with current timestamp in msecs.
    const currentTime = unixTimeMsecs()
    const id = requestedId ? requestedId : currentTime

    // log POST request  
    log(`request POST ${id} ${'speechBuffer'} ${requestedModelName? requestedModelName: ''} ${requestedGrammar? requestedGrammar: ''}`, null, currentTime)

    // if query argument "model" is specified in the client request,
    // it must be equal to the model name loaded by the server
    if ( requestedModelName && (requestedModelName !== modelName) ) 
      return errorResponse(`id ${id} Vosk model ${model} unknown`, 404, res)

    // get request body binary data
    // containing speech WAV file 
    // TODO Validation of body  

    setTimer('attachedFile')

    //let body = []
    let speechAsBuffer = Buffer.alloc(0) 
    
    req.on('data', (chunk) => { 
      //body.push(chunk) 
      speechAsBuffer = Buffer.concat([speechAsBuffer, chunk])
    })

    // all the body is received 
    req.on('end', () => {
      
      //const speechAsBuffer = Buffer.concat(body)

      if (debug) 
        log(`HTTP POST attached file elapsed ${getTimer('attachedFile')}ms`, 'DEBUG')

      responseTranscriptPost(id, speechAsBuffer, requestedModelName, requestedGrammar, requestAcceptText, res)
    
    })
  }  
  
  // all other HTTP methods 
  else
    return errorResponse(`method not allowed ${req.method}`, 405, res)

}  


async function responseTranscriptGet(id, requestedFilename, requestedModelName, requestedGrammar, requestAcceptText, res) {

  try {

    if (debug) {
      // new thread started, increment global counter of active thread running
      activeRequests++
      log(`active requests ${activeRequests}`, 'DEBUG')
    }

    // speech recognition of an audio file
    setTimer('transcript')
    const grammar = requestedGrammar ? JSON.parse(requestedGrammar) : undefined
    const result = await transcriptFromFile(requestedFilename, model, {grammar, multiThreads})

    if (debug) {
      // thread finished, decrement global counter of active thread running
      activeRequests--
      log(`active requests ${activeRequests}`, 'DEBUG')
    }  

    const latency = getTimer('transcript')

    if (debug)
      log(`latency ${id} ${latency}ms`, 'DEBUG')

    const body = requestAcceptText ? 
      responseText(result, res) : 
      responseJson(id, latency, result, res)
    
    return successResponse(id, body, res)

  }
  catch (error) {
    return errorResponse(`id ${id} transcript function ${error}`, 415, res)
  }  

}  


async function responseTranscriptPost(id, buffer, requestedModelName, requestedGrammar, requestAcceptText, res) {

  if (debug) 
    log(`Body Buffer length ${Buffer.byteLength(buffer)}`)
    
  try {

    if (debug) {
      // new thread started, increment global counter of active thread running
      activeRequests++
      log(`active requests ${activeRequests}`, 'DEBUG')
    }

    // speech recognition of an audio file
    setTimer('transcript')
    const grammar = requestedGrammar ? JSON.parse(requestedGrammar) : null
    const result = await transcriptFromBuffer(buffer, model, {grammar, multiThreads} )

    if (debug) {
      // thread finished, decrement global counter of active thread running
      activeRequests--
      log(`active requests ${activeRequests}`, 'DEBUG')
    }  

    const latency = getTimer('transcript')

    if (debug)
      log(`latency ${id} ${latency}ms`, 'DEBUG')
    
    const body = requestAcceptText ? 
      responseText(result, res) : 
      responseJson(id, latency, result, res)

    return successResponse(id, body, res)

  }  
  catch (error) {
    return errorResponse(`id ${id} transcript function ${error}`, 415, res)
  }  

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

  const validatedArgs = validateArgs(args, programName )
  const { modelDirectory, serverPort, serverPath, debugLevel } = validatedArgs

  ;({ multiThreads } = validatedArgs)

  // set modelName as a global variable
  modelName = path.basename(modelDirectory, '/')

  // debug cli argument not set, 
  // internal voskjshttp debug and Vosk log level are unset
  if ( ! debugLevel ) { 
    debug = false
    voskLogLevel = -1
    logLevel(voskLogLevel) 
  }  
  
  // internal voskjshttp debug is set but Vosk log level is unset
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

  pathRegexp = new RegExp('^' + serverPath )

  log( info() )
  log(`Model path: ${modelDirectory}`)
  log(`Model name: ${modelName}`)
  log(`HTTP server port: ${serverPort}`)
  log(`HTTP server path: ${serverPath}`)
  log(`multiThreads    : ${multiThreads}`)
  log(`internal debug log: ${debug}`)
  log(`Vosk log level: ${voskLogLevel}`)

  log(`wait loading Vosk model: ${modelName} (be patient)`);

  setTimer('loadModel')

  // create a Vosk runtime model
  model = loadModel(modelDirectory)

  log(`Vosk model loaded in ${getTimer('loadModel')} msecs`)

  // create the HTTP server instance
  const server = http.createServer( (req, res) => requestListener(req, res) )

  // listen incoming client requests
  server.listen( serverPort, () => {
    log(`server ${path.basename(__filename)} running at http://localhost:${serverPort}`)
    log(`endpoint http://localhost:${serverPort}${serverPath}`)
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

