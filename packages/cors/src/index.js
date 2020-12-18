

export default function (opts={}) {
  
  const defaults = {
    origin: '*',
    credentials: true,
    allowHeaders: 'Content-type',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  }

  const options = {
    ...defaults,
    ...opts,
  }

  if (Array.isArray(options.exposeHeaders)) {
    options.exposeHeaders = options.exposeHeaders.join(',')
  }

  if (Array.isArray(options.allowMethods)) {
    options.allowMethods = options.allowMethods.join(',')
  }

  if (Array.isArray(options.allowHeaders)) {
    options.allowHeaders = options.allowHeaders.join(',')
  }

  if (options.maxAge) {
    options.maxAge = String(options.maxAge)
  }
  
  return async ({ req, res }, next) => {
    // console.log(new Map(req.headers))
    
    // convenience helper to get/set headers
    function get (key) {
      req.headers.get(key)
    }
    
    function set (key, value) {
      res.headers.set(key, value)
      // console.log(`${key} = ${value}`)
    }
    
    // fetch the provided origin
    // const requestOrigin = get('Origin')
    
    // always set Vary
    // set('Vary', 'Origin')
    
    // skip cors if origin isn't set
    // if (!requestOrigin) return await next()
    
    // set some defaults
    // const origin = options.origin || requestOrigin
    // const credentials = !!options.credentials
    
    // always set the origin
    set('Access-Control-Allow-Origin', options.origin)
    
    if (req.method === 'OPTIONS') {
      
      if (options.credentials)
        set('Access-Control-Allow-Credentials', 'true')
      
      if (options.maxAge)
        set('Access-Control-Max-Age', options.maxAge)

      if (options.allowMethods)
        set('Access-Control-Allow-Methods', options.allowMethods)
      
      if (options.allowHeaders)
        set('Access-Control-Allow-Headers', options.allowHeaders)
      
      res.status = 204
      return
    }

    if (options.credentials)
      set('Access-Control-Allow-Credentials', 'true')
    
    if (options.allowHeaders)
      set('Access-Control-Allow-Headers', options.allowHeaders)
    
    if (options.exposeHeaders)
      set('Access-Control-Expose-Headers', options.exposeHeaders)
    
    await next()
  }
}
