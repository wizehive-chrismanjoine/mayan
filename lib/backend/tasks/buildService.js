'use strict'

const fs = require('fs')
const { exec } = require('child_process')
const rimraf = require('rimraf')
const ncp = require('ncp').ncp
const kleur = require('kleur')
const argv = require('yargs').argv
const zipFolder = require('zip-folder');


const runScript = require('../../util').runScript

const buildService = (src, dest, env) => {
  return new Promise((resolve, reject) => {
    // First clear the directory.
    if (fs.existsSync(dest)) {
      return rimraf(dest, err => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    }
    resolve()
  }).then(() => {
    // Re-create directory.
    fs.mkdirSync(dest)

    // Copy files into our build directory.
    fs.copyFileSync(`${src}/package.json`, `${dest}/package.json`)
    fs.copyFileSync(`${src}/plugin.js`, `${dest}/plugin.js`)

    // Copy folders into our build directory.
    const promises = []
    const dirs = ['_runner', 'lib', 'src']

    dirs.forEach(dir => {
      promises.push(new Promise((resolve, reject) => {
        let target = `${src}/${dir}`

        if (fs.existsSync(target)) {
          return ncp(target, `${dest}/${dir}`, err => {
            if (err) {
              return reject(err)
            }
            resolve()
          })
        }

        resolve()
      }))
    })

    return Promise.all(promises).then(() => {
      // Install package.json in production mode.
      return new Promise((resolve, reject) => {
        exec(`npm install --production`, { cwd: dest }, (err, stdout, stderr) => {
          if (err) {
            return reject(err)
          }

          argv.verbose && console.log(kleur.bgGreen(stdout))
          resolve()
        })
      })
    }).then(() => runScript(dest, 'maya-build', env)).then(out => argv.verbose && console.log(kleur.bgGreen(out))).then(() => {
      return new Promise((resolve, reject) => {
        zipFolder(dest, `${dest}/dist.zip`, function(err) {
          if(err) {
            return reject(err)
          }
          resolve()
        });
      })
    })
  })
}

module.exports = buildService