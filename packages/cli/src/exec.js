const { spawn } = require('child_process')

async function stream (cmd, onData) {
  // assemble the command
  const [bin, ...args] = cmd.split(' ')
  
  // console.log(process.env)
  
  // assemble the opts
  const opts = {
    env: { ...process.env } 
  }
  
  // start the child process
  const child = spawn(bin, args, opts)

  // wait until there's no more output
  for await (const data of child.stdout) {
    if (onData)
      onData(data, 'stdout')
  }
  
  for await (const data of child.stderr) {
    if (onData)
      onData(data, 'stderr')
  }
}

module.exports = {
  stream
}
