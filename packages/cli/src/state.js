const fs = require('fs')

const STATE_DIR  = '.simple'
const STATE_FILE = STATE_DIR + '/db.json'

function load () {
  // ensure the state dir exists
  fs.mkdirSync(STATE_DIR, { recursive: true })
  
  // verify the file actually exists
  if (!fs.existsSync(STATE_FILE)) {
    save({})
  }
  
  // read the file
  const contents = fs.readFileSync(STATE_FILE)
  
  // parse the JSON
  return JSON.parse(contents)
}

function save (data) {
  // ensure the state dir exists
  fs.mkdirSync(STATE_DIR, { recursive: true })
  
  // serialize the contents
  const contents = JSON.stringify(data, null, 2) || '{}'
  
  // save the file
  fs.writeFileSync(STATE_FILE, contents)
}

module.exports = {
  STATE_DIR,
  load,
  save,
}
