const { unixTimeMsecs } = require('./chronos')

/**
 * log
 *
 * @param {String} text
 * @param {String} type
 * @param {String} time
 * @return {Number} timestamp
 *
 */
function log(text, type, time=unixTimeMsecs()) {

  //const time = unixTimeMsecs()

  if (type)
    console.log(`${time} ${type} ${text}`)
  else
    console.log(`${time} ${text}`)

  return time

}

function main() {
  log('log test', 'debug')
}

if (require.main === module)
  main()

module.exports = { 
  log
}  

