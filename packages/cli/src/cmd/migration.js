const fs                   = require('../fs')
const { heredoc, unixNow } = require('../util')

module.exports = async function (command) {
  // todo: validation
  
  // assemble the filename
  const migration = `${unixNow()}-${command}.js`
  
  // ensure the 'migrations' directory exists
  fs.mkdirp('migrations')
  
  // create the file
  fs.createFile(`migrations/${migration}`, TEMPLATE)
}

const TEMPLATE = heredoc(`
  const { query: q } = require('faunadb')
  
  module.exports = async function (client) {
    
  }
`)
