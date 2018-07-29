'use strict'

import uuid from 'uuid-base62'
import test from 'ava'
import micro, { send } from 'micro'
import listen from 'test-listen'
import request from 'request-promise'

test('GET /:id', async t => {
  let id = uuid.v4()

  let server = micro(async (req, res) => {
    send(res, 200, { id })
  })

  let url = await listen(server)
  console.log(`URL *** ${url}`)
  let body = await request({ uri: url, json: true })
  console.log(`BODY *** ${body}`)

  t.deepEqual(body, { id })
})

test.todo('POST /')
test.todo('POST /:id/like')
