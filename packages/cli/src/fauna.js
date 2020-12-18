const faunadb = require('faunadb')
const q = faunadb.query

async function listDatabases (secret) {
  const client = new faunadb.Client({ secret })
  
  const { data } = await client.query(
    q.Paginate(
      q.Databases()
    )
  )

  return data
}

async function createDatabase (name, secret) {
  const client = new faunadb.Client({ secret })
  
  return client.query(
    q.CreateDatabase({ name })
  )
}

async function getDatabase (database, secret) {
  const client = new faunadb.Client({ secret })
  
  return client.query(
    q.Get(q.Database(database))
  )
}

async function ensureDatabase (database, secret) {
  const client = new faunadb.Client({ secret })
  
  const exists = await client.query(
    q.Exists(q.Database(database))
  )
  
  if (!exists) {
    return createDatabase(database, secret)
  } else {
    return getDatabase(database, secret)
  }
}

async function removeDatabase () {
  
}

async function listKeys (database, secret) {
  const client = new faunadb.Client({ 
    secret: `${secret}:${database}:admin`
  })
  
  const { data } = await client.query(
    q.Map(
      q.Paginate(q.Keys()),
      q.Lambda("X", q.Get(q.Var("X")))
    )
  )
  
  return data
}

async function createKey (database, secret) {
  const client = new faunadb.Client({ 
    secret: `${secret}:${database}:admin`
  })
  
  return client.query(
    q.CreateKey({
      role : 'server'
    })
  )
}

async function deleteKey (id, database, secret) {
  const client = new faunadb.Client({ 
    secret: `${secret}:${database}:admin`
  })
  
  return client.query(
    q.Delete(q.Ref(q.Keys(), id))
  )
}

module.exports = {
  listDatabases,
  createDatabase,
  ensureDatabase,
  getDatabase,
  removeDatabase,
  listKeys,
  createKey,
  deleteKey
}
