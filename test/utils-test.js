'use strict'

const test = require('ava')

test('this should pass', t => {
  t.pass()
})

test('this should failure', t => {
  t.fail()
})

test('it should support async/await', async t => {
  let expectedValue = 42
  let promise = Promise.resolve(expectedValue)
  let secret = await promise

  t.is(secret, expectedValue)
})
