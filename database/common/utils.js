'use strict'
const crypto = require('crypto')

const utils = {}

utils.extractTags = function (text) {
  let regex = /#(\w+)/g

  if (!text) return []

  let matches = text.match(regex)
  if (!matches) return []

  return matches.map(this.normalize)
}

utils.normalize = function (text) {
  let lowerCaseText = text.toLowerCase()
  let normalizeText = lowerCaseText.replace(/#/g, '')
  return normalizeText
}

utils.encrypt = function (password) {
  let shasum = crypto.createHash('sha256')
  shasum.update(password)
  return shasum.digest('hex')
}

module.exports = utils
