const faunadb                                  = require('faunadb')
const _difference                              = require('lodash.difference')
const { createKey, deleteKey, ensureDatabase } = require('./fauna')
const { dirExists, ls }                        = require('./fs')
const q = faunadb.query

async function runMigrations(database, secret) {
  // ensure the database exists
  await ensureDatabase(database, secret)
  
  // create a key
  const key = await createKey(database, secret)
  
  // create a client
  const client = new faunadb.Client({ secret: key.secret })
  
  // find out if the migrations collection exists
  const collectionExists = await client.query(q.Exists(q.Collection('migrations')))
  
  // create the migrations collection if it doesn't exist
  if (!collectionExists) {
    // create collection
    await client.query(q.CreateCollection({ name: 'migrations' }))
    
    // create an index for all migrations
    await client.query(q.CreateIndex({ 
      name  : 'all_migrations', 
      source: q.Collection('migrations')
    }))
  }
  
  // see if we have migrations
  if (dirExists('migrations')) {
    // load the migrations
    const migrations = ls('migrations', ".js")
    
    // grab the migrations that have already run
    const { data: previousMigrations } = await client.query(
      q.Map(
        q.Paginate(q.Match(q.Index('all_migrations'))),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    )
    
    // filter the list of migrations that have already run
    const pendingMigrations = _difference(migrations, previousMigrations.map(function ({ data }) {
      return data.file
    }))
    
    if (pendingMigrations.length > 0)
      console.log("Running Migrations...")
    
    for (const migrationFile of pendingMigrations) {
      console.log(migrationFile)
      
      // require the migration
      const change = require(`${process.cwd()}/migrations/${migrationFile}`)
      
      // run the migration
      console.log(`  -> ${migrationFile}`)
      await change(client)
      
      // create the document to record this migration
      await client.query(q.Create(q.Collection('migrations'), {
        data: { file: migrationFile }
      }))
    }
  }
  
  // remove the key
  await deleteKey(key.ref.id, database, secret)
}


module.exports = {
  runMigrations
}
