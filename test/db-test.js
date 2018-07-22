'use strict'

const test = require('ava')
const r = require('rethinkdb')
const uuid = require('uuid-base62')
const Database = require('../db/database')
const fixtures = require('./fixtures')
const utils = require('../common/utils')

test.beforeEach('init database', async t => {
  const dbName = `academy_db_${uuid.v4()}`
  const db = new Database({ db: dbName })
  t.context.db = db
  t.context.dbName = dbName

  await db.connect()
  t.true(db.connected, 'should be connected in database')
})

test('save image', async t => {
  let db = t.context.db
  t.is(typeof db.saveImage, 'function', 'saveImage is function')

  let image = fixtures.getImage()
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

  t.is(created.public_id, uuid.encode(created.id))
  t.truthy(created.createdAt)
})

test('like to image', async t => {
  let db = t.context.db
  t.is(typeof db.likeImage, 'function', 'likeImage is function')
  let image = fixtures.getImage()
  let created = await db.saveImage(image)
  let result = await db.likeImage(created.public_id)

  t.true(result.liked)
  t.is(result.likes, image.likes + 1)
})

test('get image', async t => {
  let db = t.context.db
  t.is(typeof db.getImage, 'function', 'getImage is function')

  let image = fixtures.getImage()
  let created = await db.saveImage(image)
  let result = await db.getImage(created.public_id)

  t.deepEqual(created, result)
  t.throws(db.getImage('foo'), /not found/)
})

test('get all images', async t => {
  let db = t.context.db
  let images = fixtures.getImages(5)

  let savedImages = images.map(image => db.saveImage(image))
  let created = await Promise.all(savedImages)

  t.is(typeof db.getImages, 'function', 'getImages is function')

  let result = await db.getImages()

  t.is(result.length, created.length)
})

test('save user in database', async t => {
  let db = t.context.db

  t.is(typeof db.saveUser, 'function', 'saveUser is function')

  let user = fixtures.getUser()
  let plainPassword = user.password
  let created = await db.saveUser(user)

  t.is(user.name, created.name)
  t.is(user.username, created.username)
  t.is(user.email, created.email)
  t.is(utils.encrypt(plainPassword), created.password)
  t.is(typeof created.id, 'string')
  t.truthy(created.createdAt)
})

test('get user in database', async t => {
  let db = t.context.db

  t.is(typeof db.getUser, 'function', 'getUser is function')

  let user = fixtures.getUser()
  let created = await db.saveUser(user)

  let result = await db.getUser(created.username)

  t.deepEqual(created, result)
  t.throws(db.getUser('foo'), /not found/)
})

test('authenticate user', async t => {
  let db = t.context.db

  t.is(typeof db.authenticate, 'function', 'authenticate is function')

  let user = fixtures.getUser()
  let plainPassword = user.password
  let created = await db.saveUser(user)

  let success = await db.authenticate(created.username, plainPassword)
  t.true(success)

  let fail = await db.authenticate(created.username, 'test')
  t.false(fail)

  let failure = await db.authenticate('foo', 'test')
  t.false(failure)
})

test.afterEach.always('cleanup database', async t => {
  let db = t.context.db
  let dbName = t.context.dbName

  await db.disconnect()
  t.false(db.connected, 'should be disconnected in database')
  let connection = await r.connect({ })
  await r.dbDrop(dbName).run(connection)
})

// test.after('setup database', async t => {
//   await db.disconnect()
//   t.false(db.connected, 'should be disconnected in database')
// })

// test.after.always('clean up database', async t => {
//   let connection = await r.connect({ })
//   await r.dbDrop(dbName).run(connection)
// })
