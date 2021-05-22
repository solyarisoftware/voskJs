/**
 * get (node program) command line arguments
 *
 * @function
 * @public
 *
 * @example
 * $ node getArgs anotherTtest -F --start=getUserName.askName
 * {
 *   args: { F: true, start: 'getUserName.askName' },
 *   commands: [ 'anotherTtest' ]
 * }
 *
 * @example
 * $ node getArgs anotherTtest -FLAGS --start=getUserName.askName
 * {
 *   args: {
 *     F: true,
 *     L: true,
 *     A: true,
 *     G: true,
 *     S: true,
 *     start: 'getUserName.askName'
 *   },
 *   commands: [ 'anotherTtest' ]
 * }
 *
 * @see https://stackoverflow.com/a/54098693/1786393
 *
 */
function getArgs () {
  const commands = [] 
  const args = {}
  process.argv
    .slice(2, process.argv.length)
    .forEach( arg => {
      // long arg
      if (arg.slice(0,2) === '--') {
        const longArg = arg.split('=')
        const longArgFlag = longArg[0].slice(2,longArg[0].length)
        const longArgValue = longArg.length > 1 ? longArg[1] : true
        args[longArgFlag] = longArgValue
      }
     // flags
      else if (arg[0] === '-') {
        const flags = arg.slice(1,arg.length).split('')
        flags.forEach(flag => {
          args[flag] = true
        })
      }
     else 
      commands.push(arg)
    })
  return { args, commands }
}


// unit test
if (require.main === module) {
  console.log( getArgs() )
}  

module.exports = { getArgs }
