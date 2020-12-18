const fs      = require('fs')
const _filter = require('lodash.filter')

// This module exists primarily to
//  1 - Provide a more familiar fs API
//  2 - Add some niceties and conveniences on top

function fileExists (path) {
  try {
    return fs.existsSync(path)
  } catch (err) {
    return false
  }
}

function existsInFile (file, pattern) {
  try {
    // read the file
    const data = readFile(file)
    
    // check the contents for the pattern
    return data.includes(pattern)
    
  } catch (err) {
    return false
  }
}

function createFile (path, content="") {
  return fs.writeFileSync(path, content)
}

function appendToFile (path, content) {
  return fs.appendFileSync(path, content)
}

function replaceFile (path, content) {
  return fs.writeFileSync(path, content)
}

function readFile (file) {
  return fs.readFileSync(file, { encoding: 'utf8', flag: 'r' })
}

function getMatchFromFile (file, pattern) {
  try {
    // return if the file doesn't exist
    if (!fileExists(file)) {
      return
    }
    
    // read the file
    const data = readFile(file)
    
    // find the matches
    const matches = data.match(pattern)
    
    // return the first match
    if (matches && matches.length > 1) {
      return matches[1]
    }
  } catch (err) {
    return
  }
}

function mkdirp (path) {
  return fs.mkdirSync(path, { recursive: true })
}

function ls (path, pattern) {
  const files = fs.readdirSync(path)
  
  if (!pattern)
    return files
    
  return _filter(files, function (file) { return file.match(pattern) })
}

module.exports = {
  appendToFile,
  createFile,
  dirExists: fileExists,
  existsInFile,
  fileExists,
  getMatchFromFile,
  ls,
  mkdirp,
  readFile,
  renameFile: fs.renameSync,
  replaceFile,
  rm: fs.unlinkSync,
}
