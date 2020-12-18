const config            = require('../config')
const exec              = require('../exec')
const fauna             = require('../fauna')
const fs                = require('../fs')
const { runMigrations } = require('../migrate')
const wrangler          = require('../wrangler')

module.exports = async function (env, command) {
  // default to prod if not defined
  if (!env)
    env = 'prod'
  
  // parse conf
  const conf = config.load(command.parent.config)
  
  // extract the name
  const { name } = conf
  
  // generate a runtime env for publish
  const runtime = {
    ...conf
  }

  // build the project
  await exec.stream(conf.buildCmd, function (data) {
    process.stdout.write(data)
  })

  // create a kv namespace (if not already exists)
  if (conf.useKV) {
    const namespace = await wrangler.ensureNamespace(`${env}_cache`, conf)
  
    // set the namespace on the runtime env
    runtime.cacheNamespace = namespace.id
  }
  
  // upload the minified source and sourcemap to KV for correct stack traces
  // todo:
  
  // publish
  await wrangler.stream(`publish -e ${env}`, runtime, function (data) {
    process.stdout.write(data)
  })
  
  let redeploy = false
  // create a fauna database (if not already exists)
  if (conf.useFauna) {
    const dbName = `${name}_${env}`
    const database = await fauna.ensureDatabase(dbName, conf.faunaAdminKey)
  
    // check to see if the secret exists
    const secretExists = await wrangler.hasSecret('FAUNADB_KEY', env, conf)
  
    // create a fauna key and set secret (if not already exists)
    if (!secretExists) {
      const key = await fauna.createKey(dbName, conf.faunaAdminKey)
      
      await wrangler.createSecret('FAUNADB_KEY', key.secret, env, conf)
      
      redeploy = true
    }
  
    // run pending migrations
    await runMigrations(dbName, conf.faunaAdminKey)
  }
  
  // re-deploy
  if (redeploy) {
    await wrangler.stream(`publish -e ${env}`, runtime, function (data) {
      process.stdout.write(data)
    })
  }
}
