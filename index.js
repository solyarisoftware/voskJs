/**
 * index.js 
 * voskJs package entry point
 */ 
const voskJs = require('./voskjs')

const publicFuntions = voskJs

module.exports = voskJs

// debug
if (require.main === module) {
  console.log(publicFuntions)
}  

