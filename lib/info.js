const packageJson = require('../package')

const version = packageJson.version
const voskApiVersion = packageJson.dependencies.vosk.slice(1)
//const authorName = packageJson.author.name
const moduleName = packageJson.name

const info = () =>
  `package ${moduleName} version ${version}, Vosk-api version ${voskApiVersion}`

function main() {
  console.log( info() )
}  

if (require.main === module) 
  main()

module.exports = { info }

