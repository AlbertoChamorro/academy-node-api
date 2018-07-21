'use strict'

const test = require('ava')
const r = require('rethinkdb')
const uuid = require('uuid-base62')
const Database = require('../db/database')

const dbName = `academy_db_${uuid.v4()}`
const db = new Database({ db: dbName })

test.before('setup database', async t => {
  await db.connect()
  t.true(db.connected, 'should be connected in database')
})

test('save image', async t => {
  t.is(typeof db.saveImage, 'function', 'saveImage is function')

  // 'http://programaenlinea.net/wp-content/uploads/2018/02/developer-3.jpg',
  let image = {
    description: '#awesome good code #123Store',
    url: `http://programaenlinea.net/wp-content/uploads/2018/02/${uuid.uuid()}.jpg`,
    likes: 0,
    liked: false,
    user_id: uuid.uuid()
  }

  let created = await db.saveImage(image)

  t.is(created.url, image.url)
  t.is(created.description, image.description)
  t.is(created.likes, image.likes)
  t.is(created.liked, image.liked)
  t.deepEqual(created.tags, [
    'awesome',
    '123store'
  ])
  t.is(created.user_id, image.user_id)

  t.is(typeof created.id, 'string')
  t.truthy(created.createdAt)
})

test.after('setup database', async t => {
  await db.disconnect()
  t.false(db.connected, 'should be disconnected in database')
})

test.after.always('clean up database', async t => {
  let connection = await r.connect({ })
  await r.dbDrop(dbName).run(connection)
})
