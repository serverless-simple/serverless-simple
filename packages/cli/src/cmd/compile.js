const config    = require('../config')
const { build } = require('../build')

module.exports = async function (command) {
  // load the config
  const conf = config.load(command.parent.config)

  // build the source
  const res = await build({ summary: true })
  
  // print the summary
  console.log(JSON.stringify(res, null, 2))
}
