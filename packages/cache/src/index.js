
// middleware to inject and manage cache layer
export default async function (ctx, next) {
  // set the cache in context
  ctx.cache = CACHE
  
  // add a withCache helper in the context
  ctx.withCache = async (key, fill) => {
    let data = await CACHE.get(key)
    
    // if we have data, return it
    if (data)
      return JSON.parse(data)
      
    // no hit, let's fetch the data to be cached
    data = await fill()
    
    // fill the cache for next time
    if (data)
      ctx.waitUntil(CACHE.put(key, JSON.stringify(data)))
      
    // return the data
    return data
  }
  
  await next()
}
