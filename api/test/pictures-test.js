'use strict'

import uuid from 'uuid-base62'
import test from 'ava'
import micro from 'micro'
import listen from 'test-listen'
import request from 'request-promise'
import Pictures from '../pictures'

test('GET /pictures/:id', async t => {
  let id = uuid.v4()
  let server = micro(Pictures)

  let url = await listen(server)
  console.log(`URL SEND *** ${url}/pictures/${id}`)
  let body = await request({ uri: `${url}/pictures/${id}`, json: true })

  t.deepEqual(body, { id })
})

test.todo('POST /pictures')
test.todo('POST /pictures/:id/like')
