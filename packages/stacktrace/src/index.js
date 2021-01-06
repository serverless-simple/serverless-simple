import ErrorStackParser from 'error-stack-parser'
import StackTraceGPS    from 'stacktrace-gps'
import SourceMap        from 'source-map'

// helper to translate a stack of frames to a readable stacktrace
function stackToString (stack) {
  const lines = stack.map(frame => {
    // parse the pieces
    const func = frame.functionName;
    const file = frame.fileName.replace(/webpack:\/\/\//g, '')
    const line = frame.lineNumber
    const col  = frame.columnNumber
    
    // generate the line
    return `  at ${func} (${file}:${line}:${col})`
  })

  // glue the lines together
  return lines.join('\n')
}

// middleware to inject a stacktrace helper
export default async function (ctx, next) {
  
  // add a stacktrace helper in the context
  ctx.stacktrace = async (err) => {
    // parse the stack
    const stack = ErrorStackParser.parse(err)
    
    // if we don't have a cache layer, just return the original stack
    if (!ctx.cache) {
      return stackToString(stack)
    }
    
    // fetch the minified source code and map from the cache
    const [minSource, sourceMap] = await Promise.all([
      ctx.cache.get('app.source'),
      ctx.cache.get('app.source.map')
    ])
    
    // if for some reason, we don't have both the minified source and the map
    // then we can't create a map from the original source, just return the original
    if (!minSource || !sourceMap) {
      return stackToString(stack)
    }
    
    // setup the source cache (so gps doesn't try to fetch externally)
    const sourceCache = {'worker.js': `${minSource}\n//# sourceMappingURL=worker.js.map`}
    
    // create a consumer cache for GPS
    const sourceMapConsumerCache = {'worker.js.map': new SourceMap.SourceMapConsumer(sourceMap)}
    
    // instantiate a gps translator
    const gps = new StackTraceGPS({offline: true, sourceCache: sourceCache, sourceMapConsumerCache: sourceMapConsumerCache})
    
    // translate the stack to the original source
    const realStack = await Promise.all(stack.map(async (frame) => {
      return gps.pinpoint(frame)
    }))
    
    // return the realstack as a readable string
    return stackToString(realStack)
  }
  
  await next()
}
