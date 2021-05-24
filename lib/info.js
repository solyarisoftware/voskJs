const packageJson = require('../package')

const version = packageJson.version
const voskApiVersion = packageJson.dependencies.vosk
const authorName = packageJson.author.name

function info(programName='voskjs') {
  console.log()
  console.log(`${programName} by ${authorName}`)
  console.log(`Version ${version}, using Vosk-api version ${voskApiVersion}`)
}  

function main() {
  info()
}  

if (require.main === module) 
  main()

module.exports = { info }

