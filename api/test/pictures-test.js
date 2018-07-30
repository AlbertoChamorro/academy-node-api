'use strict'

import test from 'ava'
import micro from 'micro'
import listen from 'test-listen'
import request from 'request-promise'
import Pictures from '../pictures'
import fixtures from './fixtures'

test('GET /pictures/:id', async t => {
  let image = fixtures.getImage()
  let server = micro(Pictures)

  let url = await listen(server)
  console.log(`URL SEND *** ${url}/pictures/${image.id}`)
  let body = await request({ uri: `${url}/pictures/${image.id}`, json: true })

  t.deepEqual(body, image)
})

test.todo('POST /pictures')
test.todo('POST /pictures/:id/like')
