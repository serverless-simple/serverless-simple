const { setCache } = require('./wrangler')

async function uploadSource (env, conf) {
  // set the key/val
  return setCache('app.source', 'file://./dist/worker.js', conf)
}

async function uploadSourceMap (env, conf) {
  // set the key/val
  return setCache('app.source.map', 'file://./dist/worker.js.map', conf)
}

async function uploadSources (env, conf) {
  return Promise.all([
    uploadSource(env, conf),
    uploadSourceMap(env, conf)
  ])
}

module.exports = {
  uploadSource,
  uploadSourceMap,
  uploadSources
}
