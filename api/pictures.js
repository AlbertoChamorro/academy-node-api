'use strict'

import { send } from 'micro'
import HttpHash from 'http-hash'

import Db from 'academy-node-db'
import DbStub from './test/stub/db'
import config from './test/config'

const env = process.env.NODE_ENV || 'production'
let database = new Db(config.db)
console.log('config')

if (env === 'test') {
  console.log('test')
  database = new DbStub()
}

const hash = HttpHash()

hash.set('GET /pictures/:id', async function getPicture (req, res, params) {
  let id = params.id
  await database.connect()
  let image = await database.getImage(id)
  await database.disconnect()

  send(res, 200, image)
})

export default async function main (req, res) {
  let { method, url } = req
  let match = hash.get(`${method.toUpperCase()} ${url}`)

  if (match.handler) {
    try {
      await match.handler(req, res, match.params)
    } catch (e) {
      send(res, 500, { error: e.message })
    }
  } else {
    send(res, 404, { error: 'route not found' })
  }
}
