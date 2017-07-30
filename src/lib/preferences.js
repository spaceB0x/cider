'use strict'

/*
This code was take from the original npm node module 'preferences'
So Thanks to Lastguess on gitHub for this. Some small changes were
needed so the code was ported locally.
*/

function Preferences(id, defs, options) {
  options = options || {
    key: null
  }
  var self = this
  var identifier = id.replace(/[\/\?<>\\:\*\|" :]/g, '.').replace(/\.+/g, '.')
  var path = require('path')
  var homedir = require('os-homedir')()
  var dirpath = path.join(__dirname + '/../../configs')
  var filepath = path.join(dirpath, identifier + '.pref')
  var fs = require('fs')
  var writeFileAtomic = require('write-file-atomic')
  var mkdirp = require('mkdirp')
  var crypto = require('crypto')
  var password = (function () {
    var key = options.key || path.join(homedir, '.ssh', 'id_rsa')
    try {
      // Use private SSH key or...
      return fs.readFileSync(key).toString('utf8')
    } catch (e) {
      // ...fallback to an id dependant password
      return 'PREFS-' + identifier
    }
  })()
  var savePristine = false
  var savedData = null

  function encode(text) {
    var cipher = crypto.createCipher('aes128', password)
    return cipher.update(new Buffer(text).toString('utf8'), 'utf8', 'hex') + cipher.final('hex')
  }

  function decode(text) {
    var decipher = crypto.createDecipher('aes128', password)
    return decipher.update(String(text), 'hex', 'utf8') + decipher.final('utf8')
  }

  function save() {
    var payload = encode(String(JSON.stringify(self) || '{}'))
    try {
      mkdirp.sync(dirpath, parseInt('0700', 8))
      writeFileAtomic.sync(filepath, payload, {
        mode: parseInt('0666', 8)
      })
    } catch (err) {}
  }

  try {
    // Try to read and decode preferences saved on disc
    savedData = JSON.parse(decode(fs.readFileSync(filepath, 'utf8')))
  } catch (err) {
    // Read error (maybe file doesn't exist) so update with defaults
    savedData = defs || {}
    savePristine = true
  }

  // Clone object
  for (var o in savedData) self[o] = savedData[o]

  // Config file was empty, save default values
  savePristine && save()


  // Save all on program exit
  process.on('exit', save)

  // If supported observe object for saving on modify
  if (Object.observe) Object.observe(self, save)

  return self
}

module.exports = Preferences