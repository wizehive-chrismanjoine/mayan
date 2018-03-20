'use strict'

const deploy = require('../lib/deploy')

exports.command = 'deploy [plugin]'

exports.desc = 'Deploy plugin'

exports.builder = (yargs) => {
  yargs.positional('plugin', {
    describe: 'Plugin name',
    type: 'string',
    default: '*'
  })
}

exports.handler = deploy
