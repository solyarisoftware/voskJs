/**
 * @module chronos
 *
 * @see https://nodejs.org/api/perf_hooks.html#perf_hooks_performance_now 
 *
 */
//import { fileURLToPath } from 'url';
//import process from 'process';
//import { performance } from 'perf_hooks'
const { performance } = require('perf_hooks');


/**
 * @constant
 * look-up table as hash to store timers  
 */
const TIMERS = {}

/**
 * sleep for a number of milliseconds
 *
 * @param {Integer} ms milliseconds to sleep
 * @return Promise
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}


/**
 * set timer
 *
 * @function
 * @param {String} label
 * @return {Number} unix timestamp (in msecs)
 *
 */
function setTimer(label) {  
  return ( TIMERS[label] = performance.now() )
}  


/**
 * get timer
 *
 * @function
 * @param {String} label
 * @return {Number} elapsed timestamp (in msecs)
 *
 */
function getTimer(label) {

  const timer = TIMERS[label]
  if ( !timer )
    throw `no timer found for label ${label}` 

  //const seconds = Math.round(milliseconds/1000)
  //console.log('endTimerCounter:seconds: ' + seconds)

  // elapsed time, rounded to milliseconds 
  return Math.floor( performance.now() - timer )
}


function unixTimeSecs() {
  return Math.floor(Date.now() / 1000)
}  

function unixTimeMsecs() {
  return Math.floor(Date.now())
}  


async function main() {

  const firstTimer = 'first'
  const secondTimer = 'second'

  setTimer(firstTimer)

  await sleep(1000)
  
  const endFirstTimer = getTimer(firstTimer)
  console.log(`timer ${firstTimer}: ${endFirstTimer}ms`)
  
  setTimer(secondTimer)
  
  await sleep(500)
  
  const endSecondTimer = getTimer(secondTimer)
  console.log(`timer ${secondTimer}: ${endSecondTimer}ms`)
  console.log(`timer ${firstTimer}: ${getTimer(firstTimer)}ms`)

}

//if (process.argv[1] === fileURLToPath(import.meta.url))
if (require.main === module)
  main()

// export
module.exports = { 
  unixTimeSecs,
  unixTimeMsecs,
  setTimer,
  getTimer
}  

