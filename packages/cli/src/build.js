const util = require('util')
const exec = util.promisify(require('child_process').exec)

function generateWebpackConfig() {
  
}

async function webpackBuild(opts={}) {
  // extract the opts
  const { summary } = opts
  
  // run webpack
  const { stdout } = await exec('webpack --json', { maxBuffer: 1024 * 1024 * 10 })
  
  // parse the results
  const res = JSON.parse(stdout)
  
  // unless summary, return everything
  if (!summary) {
    return res
  }
  
  // extract the important parts
  const { errors, warnings, assets } = res
  
  // return a simple summary
  return { 
    errors, 
    warnings, 
    assets: assets.map(function ({ name, size }) {
      return { name, size }
    })
  }
}

module.exports = {
  build: webpackBuild
}
