const http = require('http')
const path = require('path')
const { loadModel, transcript, freeModel } = require('../voskjs')

// set the language model
const modelName = 'vosk-model-small-en-us-0.15'
//const modelName = 'vosk-model-en-us-aspire-0.2'
const modelDirectory = '../models/' + modelName

let model

const PORT = 3000
const URL = '/transcript'

function unixTimeMsecs() {
  return Math.floor(Date.now())
}  


function log(text) {
  console.log(`${unixTimeMsecs()} ${text}`)
}


function logError(text) {
  console.error(`${unixTimeMsecs()} ${text}`)
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

  if (req.method !== 'POST' || req.url !== URL) {
    const message = 'method or url not allowed'
    res.statusCode = 405
    res.end(`{"error":"${message}"}`)
    logError(message)
    return
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
    catch (e) {
      const message = 'cannot parse body'
      res.statusCode = 400
      res.end(`{"error":"${message}"}`)
      logError(message)
      return
    }

    //
    // validate body data
    //
    if (!parsedBody.speech || !parsedBody.model) {
      const message = 'invalid body data'
      res.statusCode = 405
      res.end(`{"error":"${message}"}`)
      logError(message)
      return
    }  

    try {
      // speech recognition of an audio file
      const transcriptData = await transcript(parsedBody.speech, model)

      const latency = transcriptData.latency
      //const words = transcriptData.result
      //const text = transcriptData.text
      
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
      console.error(error) 
    }  
    

  })
}  


async function main() {

  const server = http.createServer( (req, res) => requestListener(req, res) )
  
  process.on('SIGTERM', shutdown )
  process.on('SIGINT', shutdown )
  
  log('Press Ctrl-C to shutdown')


  log(`Model directory: ${modelDirectory}`)

  let latency

  // create a Vosk runtime model
  ( { model, latency } = await loadModel(modelDirectory) );

  log(`init model latency: ${latency}ms`)

  server.listen( PORT, () => {
    log(`Server ${path.basename(__filename)} running at http://localhost:${PORT}`)
    log(`Endpoint POST http://localhost:${PORT}${URL}`)
  })

}

main()

