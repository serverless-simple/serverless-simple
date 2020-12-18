const { load: loadConfig } = require('../config')
const wrangler             = require('../wrangler')

module.exports = async function (command) {
  // load the config
  const config = loadConfig()
  
  // set the stdio to inherit from this process
  config.stdout = 'inherit'
  
  // command is provided as an array, let's turn it into a string
  const cmd = command.join(' ')
  
  // stream the command, printing the data as it comes out
  await wrangler.stream(cmd, config, function (data) {
    process.stdout.write(data)
  })
}
