import faunadb, { query } from 'faunadb'

// re-export query and faunadb as a convenience
export { query }

// middleware to inject a faunadb
export default async function (ctx, next) {
  // init and inject db if configured
  if (typeof FAUNADB_KEY !== "undefined" && FAUNADB_KEY !== null) {
    // set db in the context
    ctx.db = new faunadb.Client({
      secret: FAUNADB_KEY,
      fetch: fetch.bind(globalThis),
    })
  } else {
    // inject a fake db
    ctx.db = {
      query: async => undefined
    }
  }
  
  await next()
}
