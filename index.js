/**
 * index.js 
 * voskJs package entry point
 */ 
const voskJs = require('./voskjs')
const audioutils = require('./lib/audioutils.js')

const publicFuntions = {
  ...voskJs,
  ...audioutils
}  


module.exports = publicFuntions

// debug
if (require.main === module) {
  console.log(publicFuntions)
}  

