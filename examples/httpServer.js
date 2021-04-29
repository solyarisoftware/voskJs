const http = require('http')
const path = require('path')

const { logLevel, loadModel, transcript, freeModel } = require('../voskjs')

// set the language model
const MODEL_NAME = 'vosk-model-small-en-us-0.15'
//const MODEL_NAME = 'vosk-model-en-us-aspire-0.2'
const MODEL_DIRECTORY = '../models/' + MODEL_NAME

let model

const HTTP_METHOD = 'POST' 
const HTTP_PORT = 3000
const HTTP_URL = '/transcript'


function unixTimeMsecs() {
  return Math.floor(Date.now())
}  


function log(text, type) {
  if (type)
    console.log(`${unixTimeMsecs()} ${type} ${text}`)
  else
    console.log(`${unixTimeMsecs()} ${text}`)
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


function shutdown(signal) {

  log(`${signal} received...`)
  
  // free the Vosk runtime model
  freeModel(model)
  
  log('Shutdown done.')
  
  process.exit(0)
}  


function requestListener(req, res) {
  
  // This function is called once the headers have been received
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== HTTP_METHOD || req.url !== HTTP_URL) {
    return errorResponse('method or url not allowed', 405, res)
  }

  let body = ''

  // This function is called as chunks of body are received
  req.on('data', (data) => { body += data })

  // This function is called once the body has been fully received
  req.on('end', async () => {

    log(`request ${body}`)

    let parsedBody

    try {
      parsedBody = JSON.parse(body)
    }
    catch (error) {
      return errorResponse(`cannot parse request body ${error}`, 400, res)
    }

    //
    // validate body data
    //
    if ( !parsedBody.speech || !parsedBody.model ) 
      return errorResponse('invalid body data', 405, res)

    try {
      // speech recognition of an audio file
      const transcriptData = await transcript(parsedBody.speech, model)

      const latency = transcriptData.latency
      
      // return JSON data structure
      const json = JSON.stringify({
        ... parsedBody,
        ... { latency },
        ... transcriptData.result 
        })

      log(`transcript latency: ${latency}ms`)
      log(`response ${json}`)
      res.end(json)
    }  
    catch (error) {
      return errorResponse(`transcript function ${error}`, 415, res)
    }  

  })
}  


async function main() {

  const server = http.createServer( (req, res) => requestListener(req, res) )
  
  process.on('SIGTERM', shutdown )
  process.on('SIGINT', shutdown )
  
  log('Press Ctrl-C to shutdown')


  log(`Model directory: ${MODEL_DIRECTORY}`)

  // set the vosk log level to silence 
  logLevel(-1) 

  let latency

  // create a Vosk runtime model
  ( { model, latency } = await loadModel(MODEL_DIRECTORY) );

  log(`load model latency: ${latency}ms`)

  server.listen( HTTP_PORT, () => {
    log(`Server ${path.basename(__filename)} running at http://localhost:${HTTP_PORT}`)
    log(`Endpoint http://localhost:${HTTP_PORT}${HTTP_URL}`)
  })

}

main()

