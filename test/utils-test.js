'use strict'

const test = require('ava')
const utils = require('../common/utils')

test('this should pass', t => {
  t.pass()
})

// test('this should failure', t => {
//   t.fail()
// })

test('it should support async/await 1', async t => {
  let expectedValue = 42
  let promise = Promise.resolve(expectedValue)
  let secret = await promise

  t.is(secret, expectedValue)
})

test('it should support async/await 2', async t => {
  let expectedValue = 2
  let secret = await asyncFunctionToTest(expectedValue)

  t.is(secret, expectedValue)
})

let asyncFunctionToTest = value => {
  let array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  return new Promise((resolve, reject) => {
    let findValue = array.filter(item => item === value)[0]
    return resolve(findValue)
  })
}

test('extracting hashtags from text', t => {
  let tags = utils.extractTags('a #picture with tags #AwEsome #App and #AVA and #100 ##yes')
  t.deepEqual(tags, [
    'picture',
    'awesome',
    'app',
    'ava',
    '100',
    'yes'
  ])

  tags = utils.extractTags('a picture wihtout any things')
  t.deepEqual(tags, [])

  tags = utils.extractTags()
  t.deepEqual(tags, [])

  tags = utils.extractTags(null)
  t.deepEqual(tags, [])
})

test('encrypt password', t => {
  let password = 'd3v3l0p3r7890$'
  let encrypted = '10078ab05c7f309252ad377791ecb2be3801e2a95e0edbbe9f81e98c1a732f49'

  t.is(typeof utils.encrypt, 'function', 'encrypt is function')
  let result = utils.encrypt(password)

  t.is(result, encrypted)
})
