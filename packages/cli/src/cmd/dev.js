const _get                                     = require('lodash.get')
const { default: ShortUniqueId }               = require('short-unique-id')
const { load: loadConfig }                     = require('../config')
const { createDatabase, createKey, deleteKey } = require('../fauna')
const fs                                       = require('../fs')
const { runMigrations }                        = require('../migrate')
const { load: loadState, save: saveState }     = require('../state')
const { ensureNamespace, stream }              = require('../wrangler')

// generate a short, unique ID
const uid = new ShortUniqueId()

module.exports = async function (command) {
  // parse config
  const config = loadConfig(command.parent.config)
  
  // parse state
  const state = loadState()
  
  // extract the project name
  const name = fs.getMatchFromFile('wrangler.toml', /name = "(.+)"/)
  
  // generate unique id
  if (!state.devId) {
    state.devId = uid()
  }

  // generate a runtime env for the dev command
  const env = {
    ...config
  }

  // create kv namespace
  if (config.useKV) {
    if (!state.devCacheNamespaceId) {
      const namespace = await ensureNamespace(`dev_${state.devId}_cache`, config)
      state.devCacheNamespaceId = namespace.id
    }
    
    // set the namespace on the runtime env
    env.cacheNamespace = state.devCacheNamespaceId
  }
  
  // create fauna database
  let key = undefined
  if (config.useFauna) {
    if (!state.devFaunaDatabaseId) {
      const database = await createDatabase(`${name}_dev_${state.devId}`, config.faunaAdminKey)
      state.devFaunaDatabaseId = database.ref.id
    }
    
    // create fauna key
    key = await createKey(state.devFaunaDatabaseId, config.faunaAdminKey)
    
    // set the key on the runtime env
    env.faunaDbKey = key.secret
  }
  
  // persist state
  saveState(state)
  
  // run migrations
  if (config.useFauna)
    await runMigrations(state.devFaunaDatabaseId, config.faunaAdminKey)
  
  // cleanup
  let cleaned = false
  const cleanup = async function () {
    if (cleaned)
      return
      
    cleaned = true
    
    if (config.useFauna) {
      // delete the key
      await deleteKey(key.ref.id, state.devFaunaDatabaseId, config.faunaAdminKey)
    }
  }
  
  // cleanup on ctrl+c
  process.on('SIGINT', cleanup)
  
  // run dev!
  await stream('dev -e dev', env, function (data) {
    if (!cleaned)
      process.stdout.write(data)
  })

  // give the console back
  console.log('')
  
  // cleanup
  await cleanup()
}
