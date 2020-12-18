# serverless-simple

Develop and deploy serverless apps on Cloudflare. Focus on your app, not the details.

## packages

- `@serverless-simple/app`: [readme](https://github.com/serverless-simple/serverless-simple/tree/master/packages/app/README.md) | [npm](https://www.npmjs.com/package/@serverless-simple/app)

    The serverless app instance
- `@serverless-simple/cache`: [readme](https://github.com/serverless-simple/serverless-simple/tree/master/packages/cache/README.md) | [npm](https://www.npmjs.com/package/@serverless-simple/cache)

    Serverless-simple middleware for managing a KV cache layer
- `@serverless-simple/cli`: [readme](https://github.com/serverless-simple/serverless-simple/tree/master/packages/cli/README.md) | [npm](https://www.npmjs.com/package/@serverless-simple/cli)

    CLI for developing and deploying serverless-simple apps
- `@serverless-simple/cors`: [readme](https://github.com/serverless-simple/serverless-simple/tree/master/packages/cors/README.md) | [npm](https://www.npmjs.com/package/@serverless-simple/cors)

    Serverless-simple middleware for setting CORS config
- `@serverless-simple/faunadb`: [readme](https://github.com/serverless-simple/serverless-simple/tree/master/packages/faunadb/README.md) | [npm](https://www.npmjs.com/package/@serverless-simple/faunadb)

    Serverless-simple middleware for using FaunaDB
- `@serverless-simple/graphql`: [readme](https://github.com/serverless-simple/serverless-simple/tree/master/packages/graphql/README.md) | [npm](https://www.npmjs.com/package/@serverless-simple/graphql)

    Serverless-simple middleware for building graphql endpoints

## contributing

Install dependencies using yarn. Yarn will ensure serverless-simple packages that depend on other serverless-simple packages are linked properly.

```
yarn install
```

Refer to each package's README for more specific instructions and examples.
