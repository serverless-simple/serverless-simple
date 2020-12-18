#!/usr/bin/env node

// initiate the app
const app = require('commander')

// import the commands
const init      = require('../src/cmd/init')
const dev       = require('../src/cmd/dev')
const deploy    = require('../src/cmd/deploy')
const teardown  = require('../src/cmd/teardown')
const test      = require('../src/cmd/test')
const migrate   = require('../src/cmd/migrate')
const migration = require('../src/cmd/migration')
const wrangler  = require('../src/cmd/wrangler')

// set the defaults
app
  .option('-c, --config <path>', 'Config path, defaults to ./simple.config.js', `${process.cwd()}/simple.config.js`)

// init serverless-simple
app
  .command('init')
  .description('Initialize a project with serverless-simple')
  .action(init)

// dev
app
  .command('dev')
  .description('Run and develop the app, locally')
  .action(dev)

// test
app
  .command('test')
  .description('Run the test suite')
  .action(test)

// deploy
app
  .command('deploy [env]')
  .description('Deploy the app live')
  .action(deploy)

// teardown
app
  .command('teardown')
  .description('Tear down a deployment')
  .action(teardown)

// migration
app
  .command('migration')
  .description('Generate a migration from template')
  .action(migration)

// migrate
app
  .command('migrate')
  .description('Run pending migrations')
  .action(migrate)
  
// wrangler
app
  .command('wrangler [subcommand...]')
  .description('Run wrangler command within serverless-simple environment')
  .allowUnknownOption(true)
  .storeOptionsAsProperties(true)
  .action(wrangler)
  
// run the app!
app.parseAsync(process.argv)
