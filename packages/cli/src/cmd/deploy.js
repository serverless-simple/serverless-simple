const { load: loadConfig }                                 = require('../config')
const fs                                                   = require('../fs')
const { ensureNamespace, createSecret, hasSecret, stream } = require('../wrangler')
const { createKey, ensureDatabase }                        = require('../fauna')
const { runMigrations }                                    = require('../migrate')

module.exports = async function (env, command) {
  // default to prod if not defined
  if (!env)
    env = 'prod'
  
  // parse config
  const config = loadConfig(command.parent.config)
  
  // extract the name
  const { name } = config
  
  // generate a runtime env for publish
  const runtime = {
    ...config
  }

  // create a kv namespace (if not already exists)
  if (config.useKV) {
    const namespace = await ensureNamespace(`${env}_cache`, config)
  
    // set the namespace on the runtime env
    runtime.cacheNamespace = namespace.id
  }
  
  // publish
  await stream(`publish -e ${env}`, runtime, function (data) {
    process.stdout.write(data)
  })
  
  let redeploy = false
  // create a fauna database (if not already exists)
  if (config.useFauna) {
    const dbName = `${name}_${env}`
    const database = await ensureDatabase(dbName, config.faunaAdminKey)
  
    // check to see if the secret exists
    const secretExists = await hasSecret('FAUNADB_KEY', env, config)
  
    // create a fauna key and set secret (if not already exists)
    if (!secretExists) {
      const key = await createKey(dbName, config.faunaAdminKey)
      
      await createSecret('FAUNADB_KEY', key.secret, env, config)
      
      redeploy = true
    }
  
    // run pending migrations
    await runMigrations(dbName, config.faunaAdminKey)
  }
  
  // re-deploy
  if (redeploy) {
    await stream(`publish -e ${env}`, runtime, function (data) {
      process.stdout.write(data)
    })
  }
}
