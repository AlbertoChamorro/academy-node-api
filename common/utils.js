'use strict'

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

module.exports = utils
