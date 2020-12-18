const fs = require('./fs')

const DEFAULTS = {
  useKV    : false,
  useFauna : false,
  language : 'javascript',
  testCmd  : 'jest'
}

function env () {
  return {
    cfApiToken    : process.env.CF_API_TOKEN    || fs.getMatchFromFile('.env.simple', /CF_API_TOKEN=(.+)/),
    faunaAdminKey : process.env.FAUNA_ADMIN_KEY || fs.getMatchFromFile('.env.simple', /FAUNADB_ADMIN_KEY=(.+)/),
    cfAccountId   : process.env.CF_ACCOUNT_ID   || fs.getMatchFromFile('wrangler.toml', /account_id = "(.+)"/),
    cfZoneId      : process.env.CF_ZONE_ID      || fs.getMatchFromFile('wrangler.toml', /zone_id = "(.+)"/),
  }
}

function load (file) {
  let config = {}
  
  // check to see if simple.config.js exists
  if (fs.fileExists(file))
    config = require(file)
    
  // return the defaults with the custom config merged into it
  return {
    ...DEFAULTS,
    ...config,
    ...env(),
    name: fs.getMatchFromFile('wrangler.toml', /name = "(.+)"/)
  }
}

module.exports = {
  env,
  load,
}
