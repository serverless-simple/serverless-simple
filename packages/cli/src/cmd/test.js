const faunadb = require('faunadb')
const q = faunadb.query

module.exports = async function (command) {
  
  // const adminClient = new faunadb.Client({
  //   secret: 'fnAD4DdBufACBLaq3tuKw_TNdCtLdjSRm2Tcn0LJ'
  //   // secret: 'fnAD4KXJPbACCeptrv1dN2QXACUXHCn95FJI30Hh'
  // })
  // 
  // const db = await adminClient.query(
  //   q.CreateDatabase({ name: 'annuvin' })
  // )
  // console.log(db)
  
  const dbClient = new faunadb.Client({
    secret: 'fnAD4DdBufACBLaq3tuKw_TNdCtLdjSRm2Tcn0LJ:annuvin:admin'
  })
  
  // const dbClient = new faunadb.Client({
  //   secret: 'SECRET:annuvin:admin'
  // })
   
  // const key = await dbClient.query(
  //   q.CreateKey({
  //     // database: q.Database('annuvin'),
  //     role: 'server',
  //   })
  // )
  // console.log(key)
    
  const keys = await dbClient.query(
    q.Map(
      q.Paginate(q.Keys()),
      q.Lambda("X", q.Get(q.Var("X")))
    )
  )
  console.log(keys)

  // const client = new faunadb.Client({
  //   secret: key.secret
  // })
  // 
  // const collection = await client.query(
  //   q.CreateCollection({ name: 'spells' })
  // )
  // console.log(collection)
  
}
