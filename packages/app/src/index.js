import { Application, Router, validate } from '@cfworker/web'

// re-export pieces from @cfworker as a convenience
export { Router, validate }

export default function () {
  // initialize a cfworker app
  const app = new Application()
  
  // init global error handler/logger
  
  // return the app
  return app
}
