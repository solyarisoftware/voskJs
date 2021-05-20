/**
 * index.js 
 * voskJs package entry point
 */ 
const voskJs = require('./voskjs')
const toPCM = require('./lib/toPCM')

const publicFuntions = {
  ...voskJs,
  ...toPCM
}  


module.exports = publicFuntions

// debug
if (require.main === module) {
  console.log(publicFuntions)
}  

