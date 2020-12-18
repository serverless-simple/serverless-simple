
function unixNow () {
  return new Date().getTime()
}

function heredoc (content) {
  // grab the lines and drop the first empty line
  const lines = content.split("\n").slice(1)
  
  // fetch the indent level from the whitespace of the first line
  const indent = lines[0].match(/^\s*/)[0].length
  
  // strip the indentation from all of the lines, and join with newlines
  return lines.map(function (line) { return line.slice(indent) }).join("\n")
}

module.exports = {
  heredoc,
  unixNow
}
