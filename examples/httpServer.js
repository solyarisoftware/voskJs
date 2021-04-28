const http = require('http')
const path = require('path')
const { initModel, transcript, freeModel } = require('../voskjs')

// fix the language model
const modelDirectory = '../models/vosk-model-en-us-aspire-0.2'
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


const server = http.createServer( (req, res) => {
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
      const result = await transcript(parsedBody.speech, model)
      
      // return JSON data structure
      const json = JSON.stringify({
        ...parsedBody,
        ...{ transcript: { 
          ...result, 
          ...{ elapsed:'TBD' } } 
        }
      })

      log(json)
      res.end(json)
    }  
    catch (error) {
      console.error(error) 
    }  
    

  })
})


async function main() {

  process.on('SIGTERM', shutdown )
  process.on('SIGINT', shutdown )
  
  log('Press Ctrl-C to shutdown')

  // create a Vosk runtime model
  model = await initModel(modelDirectory)

  log(`Model directory: ${modelDirectory}`)

  server.listen( PORT, () => {
    log(`Server ${path.basename(__filename)} running at http://localhost:${PORT}`)
    log(`Endpoint POST http://localhost:${PORT}${URL}`)
  })

}

main()

