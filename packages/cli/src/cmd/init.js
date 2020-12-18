const inquirer    = require('inquirer')
const { render }  = require('mustache')
const homedir     = require('os').homedir()
const path        = require('path')
const fs          = require('../fs')
const { heredoc } = require('../util')

module.exports = async function (command) {
  // all of the data that we'll need
  let data = {
    appName      : process.env.APP_NAME,
    cfApiToken   : process.env.CF_API_TOKEN,
    cfAccountId  : process.env.CF_ACCOUNT_ID,
    cfZoneId     : process.env.CF_ZONE_ID,
    faunaAdminKey: process.env.FAUNA_ADMIN_KEY,
    useKV        : false,
    useFauna     : false,
    language     : 'javascript'
  }
  
  // create an empty .gitignore file if one doesn't exist
  if (!fs.fileExists('.gitignore'))
    fs.createFile('.gitignore')
  
  // add entries into .gitignore (if not already)
  if (!fs.existsInFile('.gitignore', 'Serverless-simple'))
    fs.appendToFile('.gitignore', GITIGNORE)
  
  // try to fetch the name from the wrangler.toml file
  if (!data.appName)
    data.appName = fs.getMatchFromFile('wrangler.toml', /name = "(.+)"/)
  
  // ask for the project/app name if we don't have it
  if (!data.appName) {
    const { appName } = await inquirer.prompt([{
      name   : 'appName',
      message: "App name",
      default: path.basename(process.cwd())
    }])
    data.appName = appName
  }
  
  // try to fetch the cloudflare api token
  if (!data.cfApiToken)
    data.cfApiToken = fs.getMatchFromFile('.env.simple', /CF_API_TOKEN=(.+)/)
  
  // ask for cloudflare api token if we don't have it
  // https://dash.cloudflare.com/profile/api-tokens
  // Template: 'Edit Cloudflare Workers'
  if (!data.cfApiToken) {
    const { cfApiToken } = await inquirer.prompt([{
      name   : 'cfApiToken',
      message: "Cloudflare API token (https://dash.cloudflare.com/profile/api-tokens)",
      default: fs.getMatchFromFile(`${homedir}/.wrangler/config/default.toml`, /api_token = "(.+)"/)
    }])
    data.cfApiToken = cfApiToken
  }
  
  // try to fetch the cloudflare account id
  if (!data.cfAccountId)
    data.cfAccountId = fs.getMatchFromFile('wrangler.toml', /account_id = "(.+)"/)
  
  // ask for cloudflare account id (if not exists)
  // https://dash.cloudflare.com/
  //  -> Workers
  //  -> Account ID
  if (!data.cfAccountId) {
    const { cfAccountId } = await inquirer.prompt([{
      name   : 'cfAccountId',
      message: "Cloudflare Account ID (https://dash.cloudflare.com/ -> 'Workers' -> 'Account ID')"
    }])
    data.cfAccountId = cfAccountId
  }
  
  // try to fetch the cloudflare zone id
  if (!data.cfZoneId)
    data.cfZoneId = fs.getMatchFromFile('wrangler.toml', /zone_id = "(.+)"/)
  
  // ask for cloudflare zone id, optional
  if (!data.cfZoneId) {
    const { cfZoneId } = await inquirer.prompt([{
      name   : 'cfZoneId',
      message: "Cloudflare Zone ID (optional, unless using real domains)"
    }])
    data.cfZoneId = cfZoneId
  }
  
  // ask if they want to use Fauna (default yes)
  const { useFauna } = await inquirer.prompt([{
    type: 'confirm',
    name: 'useFauna',
    message: 'Use FaunaDB as a database?'
  }])
  data.useFauna = useFauna
  
  // try to fetch the faunadb admin key
  if (data.useFauna && !data.faunaAdminKey)
    data.faunaAdminKey = fs.getMatchFromFile('.env.simple', /FAUNADB_ADMIN_KEY=(.+)/)
  
  // ask for faunadb admin key (if not exists)
  // https://app.fauna.com/keys
  if (data.useFauna && !data.faunaAdminKey) {
    const { faunaAdminKey } = await inquirer.prompt([{
      name   : 'faunaAdminKey',
      message: "FaunaDB Admin Key (https://app.fauna.com/keys)"
    }])
    data.faunaAdminKey = faunaAdminKey
  }
  
  // ask if they want to use KV as a cache layer (default yes)
  const { useKV } = await inquirer.prompt([{
    type: 'confirm',
    name: 'useKV',
    message: 'Use KV as a cache layer? (requires a Cloudflare paid plan)'
  }])
  data.useKV = useKV
  
  // ask which language the code generator should use
  // const { language } = await inquirer.prompt([{
  //   type   : 'select',
  //   name   : 'language',
  //   message: 'Which language should the generator use?',
  //   choices: ['javascript', 'typescript', 'coffeescript']
  // }])
  // data.language = language
  
  // if existing wrangler.toml, move to .bak
  if (fs.fileExists('wrangler.toml')) {
    const { allowWranglerBak } = await inquirer.prompt([{
      type: 'confirm',
      name: 'allowWranglerBak',
      message: 'Moving existing wrangler.toml to wrangler.toml.bak, ok?'
    }])
    
    // exit if we don't have permission
    if (!allowWranglerBak)
      process.exit(1)
    
    // move the file
    fs.renameFile('wrangler.toml', 'wrangler.toml.bak')
  }
  
  // generate wrangler.toml from template
  fs.createFile('wrangler.toml', render(WRANGLER_TOML, data))
  
  // if existing simple.config.js, move to .bak
  if (fs.fileExists('simple.config.js')) {
    const { allowSimpleBak } = await inquirer.prompt([{
      type: 'confirm',
      name: 'allowSimpleBak',
      message: 'Moving existing simple.config.js to simple.config.js.bak, ok?'
    }])
    
    // exit if we don't have permission
    if (!allowSimpleBak)
      process.exit(1)
    
    // move the file
    fs.renameFile('simple.config.js', 'simple.config.js.bak')
  }
  
  // generate simple.config.js from template
  fs.createFile('simple.config.js', render(SIMPLE_CONFIG, data))
  
  // if existing .env.simple, move it to .bak
  if (fs.fileExists('.env.simple')) {
    const { allowEnvBak } = await inquirer.prompt([{
      type: 'confirm',
      name: 'allowEnvBak',
      message: 'Moving existing .env.simple to .env.simple.bak, ok?'
    }])
    
    // exit if we don't have permission
    if (!allowEnvBak)
      process.exit(1)
      
    // move the file
    fs.renameFile('.env.simple', '.env.simple.bak')
  }
  
  // generate .env.simple from template
  fs.createFile('.env.simple', render(ENV_SIMPLE, data))
  
  // All set, print something
  console.log('All set!')
}

const GITIGNORE = heredoc(`
  
  # Serverless-simple
  .simple/
  .env.simple
  .env.simple.bak
`)

const ENV_SIMPLE = heredoc(`
  CF_API_TOKEN={{cfApiToken}}
  {{#useFauna}}
  FAUNADB_ADMIN_KEY={{faunaAdminKey}}
  {{/useFauna}}
`)

const SIMPLE_CONFIG = heredoc(`
  module.exports = {
    // Manage a cache layer via Cloudflare's KV?
    useKV: {{useKV}},
    
    // Use FaunaDB as a database?
    useFauna: {{useFauna}},
    
    // Language the code generator should use
    language: '{{language}}',
    
    // command to run test suite
    testCmd: ''
  }
`)

const WRANGLER_TOML = heredoc(`
  # HEADS UP: This file was generated by serverless-simple.
  #
  # YOU CAN (and should) EDIT THIS FILE DIRECTLY. Be mindful
  # of the $VAR entries, as serverless-simple will dynamically replace them
  # with real values for each run. If you remove them, then serverless-simple
  # won't work properly.
  
  name = "{{appName}}"
  type = "webpack"
  account_id = "{{cfAccountId}}"
  zone_id = "{{cfZoneId}}"
  webpack_config = "webpack.config.js"
  workers_dev=true

  [dev]
  port=8080

  [env.dev]
  {{#useFauna}}
  # A single-use FAUNADB_KEY will be generated for each dev run
  vars = { ENV = "dev", FAUNADB_KEY = "$FAUNADB_KEY" }
  {{/useFauna}}
  {{#useKV}}
  kv_namespaces = [
    # A unique namespace will be used for each dev environment
    { binding = "CACHE", preview_id = "$CACHE_NAMESPACE" }
  ]
  {{/useKV}}
  
  [env.test]
  {{#useFauna}}
  # A single-use FAUNADB_KEY will be generated for each dev run
  vars = { ENV = "test", FAUNADB_KEY = "$FAUNADB_KEY" }
  {{/useFauna}}
  {{#useKV}}
  kv_namespaces = [
    # A namespace will be created for the duration of the test run
    { binding = "CACHE", preview_id = "$CACHE_NAMESPACE" }
  ]
  {{/useKV}}

  [env.staging]
  # routes = ["your.staging-app.com/*"]
  vars = { ENV = "staging" }
  {{#useKV}}
  kv_namespaces = [
    { binding = "CACHE", id = "$CACHE_NAMESPACE" }
  ]
  {{/useKV}}

  [env.prod]
  # routes = ["your.app.com/*"]
  vars = { ENV = "prod" }
  {{#useKV}}
  kv_namespaces = [
    { binding = "CACHE", id = "$CACHE_NAMESPACE" }
  ]
  {{/useKV}}
`)
