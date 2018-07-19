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

test('it should support async/await', async t => {
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
