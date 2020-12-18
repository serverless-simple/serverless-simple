const _filter       = require('lodash.filter')
const { spawn }     = require('child_process')
const util          = require('util')
const exec          = util.promisify(require('child_process').exec)
const fs            = require('./fs')
const { STATE_DIR } = require('./state')

// wrangler file locations
const CURRENT_WRANGLER = './wrangler.toml'
const CUSTOM_WRANGLER  = `${STATE_DIR}/wrangler.toml`

async function listNamespaces (config) {
  // list namespaces
  const { stdout } = await run('kv:namespace list', config)

  // de-serialize
  const namespaces = JSON.parse(stdout)

  // return the namespaces
  return namespaces
}

async function createNamespace (title, config) {
  // assemble the command
  let cmd = `kv:namespace create ${title}`

  // create it
  const { stdout } = await run(cmd, config)

  // extract the id from the output
  const id = stdout.match(/id = "(.*)"/)[1]

  // return the id
  return { id }
}

async function ensureNamespace (title, config) {
  const matches = _filter((await listNamespaces(config)), { 
    title: `${config.name}-${title}`
  })
  
  if (matches.length > 0) {
    return matches[0]
  } else {
    return createNamespace(title, config)
  }
}

async function listSecrets (env, config) {
  // list secrets
  const { stdout } = await run(`secret list --env ${env}`, config)

  // de-serialize
  const secrets = JSON.parse(stdout)

  // return the secrets
  return secrets
}

async function createSecret (key, value, env, config) {
  // assemble the command
  const cmd = `secret put ${key} --env ${env}`
  
  // create the secret
  await stream(cmd, config, function (data, _pipe, child) {
    if (`${data}`.match(/Enter the secret text you'd like assigned/)) {
      child.stdin.write(value)
      child.stdin.end()
    }
  })
}

async function ensureSecret (key, env, config) {
  const matches = _filter((await listSecrets(env, config)), { name: key })
  
  if (matches.length > 0) {
    return matches[0]
  } else {
    return createSecret(key, env, config)
  }
}

async function hasSecret (key, env, config) {
  const matches = _filter((await listSecrets(env, config)), { name: key })
  
  return (matches.length > 0)
}

async function run (cmd, config) {
  // create config
  createConfig(config)
  
  // build the command
  let command = wranglerCmd(cmd)
  
  // assemble/prefix the env
  const env = wranglerEnv(config)
  for (const key in env) {
    command = `${key}=${env[key]} ${command}`
  }
  
  // run the command
  const { stdout, stderr } = await exec(command)
  
  // remove the config
  removeConfig()
  
  // return the output
  return { stdout, stderr }
}

async function stream (cmd, config, onData) {
  // create config
  createConfig(config)
  
  // assemble the command
  const [bin, ...args] = wranglerCmd(cmd).split(' ')
  
  // assemble the opts
  const opts = {
    env: { ...process.env, ...wranglerEnv(config) } 
  }
  
  if (config.stdio) {
    opts.stdio = config.stdio
  }
  
  // start the child process
  const child = spawn(bin, args, opts)

  // don't leave the config around
  let cleaned = false

  // wait until there's no more output
  for await (const data of child.stdout) {
    if (onData)
      onData(data, 'stdout', child)
      
    if (!cleaned) {
      removeConfig()
      cleaned = true
    }
  }
  
  for await (const data of child.stderr) {
    if (onData)
      onData(data, 'stderr', child)
  }
  
  // remove the config
  removeConfig()
}

function wranglerCmd (cmd) {
  return `wrangler ${cmd} -c ${CUSTOM_WRANGLER}`
}

function wranglerEnv (config) {
  const env = {}
  
  if (config.cfApiToken)
    env.CF_API_TOKEN = config.cfApiToken
    
  if (config.cfAccountId)
    env.CF_ACCOUNT_ID = config.cfAccountId
    
  if (config.cfZoneId)
    env.CF_ZONE_ID = config.cfZoneId
    
  return env
}

function createConfig (data) {
  // read the current config
  let content = fs.readFile(CURRENT_WRANGLER)
  
  // replace keywords
  if (data.faunaDbKey)
    content = content.replace(/\$FAUNADB_KEY/g, data.faunaDbKey)
    
  if (data.cacheNamespace)
    content = content.replace(/\$CACHE_NAMESPACE/g, data.cacheNamespace)
  
  // ensure the state directory exists
  fs.mkdirp(STATE_DIR)
  
  // write new config
  fs.createFile(CUSTOM_WRANGLER, content)
}

function removeConfig () {
  // delete the new config file
  if (fs.fileExists(CUSTOM_WRANGLER))
    fs.rm(CUSTOM_WRANGLER)
}

module.exports = {
  run,
  stream,
  listNamespaces,
  createNamespace,
  ensureNamespace,
  listSecrets,
  createSecret,
  ensureSecret,
  hasSecret,
  createConfig,
  removeConfig
}
