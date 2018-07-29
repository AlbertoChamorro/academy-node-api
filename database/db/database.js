'use strict'

const r = require('rethinkdb')
const co = require('co')
const uuid = require('uuid-base62')
const Promise = require('bluebird')
const utils = require('../common/utils')

const defaults = {
  host: 'localhost',
  port: 28015,
  db: 'academy_db',
  setup: false
}

class Database {
  constructor (options = {}) {
    this.host = options.host || defaults.host
    this.port = options.port || defaults.port
    this.dbName = options.db || defaults.db
    this.setup = options.setup || defaults.setup
  }

  connect (callback) {
    let _self = this
    _self.connection = r.connect({
      host: _self.host,
      port: _self.port
    })

    _self.connected = true

    if (!_self.setup) {
      return Promise.resolve(_self.connection).asCallback(callback)
    }

    const setup = co.wrap(function * () {
      let connect = yield _self.connection
      let dbList = yield r.dbList().run(connect)

      if (dbList.indexOf(_self.dbName) === -1) {
        yield r.dbCreate(_self.dbName).run(connect)
      }

      let dbTables = yield r.db(_self.dbName).tableList().run(connect)

      if (dbTables.indexOf('images') === -1) {
        yield r.db(_self.dbName).tableCreate('images').run(connect)
        yield r.db(_self.dbName).table('images').indexCreate('createdAt').run(connect)
        yield r.db(_self.dbName).table('images').indexCreate('userId', { multi: true }).run(connect)
      }

      if (dbTables.indexOf('users') === -1) {
        yield r.db(_self.dbName).tableCreate('users').run(connect)
        yield r.db(_self.dbName).table('users').indexCreate('username').run(connect)
      }

      return connect
    })

    return Promise.resolve(setup()).asCallback(callback)
  }

  disconnect (callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    this.connected = false
    return Promise.resolve(this.connection)
      .then(con => con.close())
  }

  saveImage (image, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    const _self = this

    let tasks = co.wrap(function * () {
      let connect = yield _self.connection
      image.createdAt = new Date()
      image.tags = utils.extractTags(image.description)

      let result = yield r.db(_self.dbName).table('images').insert(image).run(connect)

      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }

      image.id = result.generated_keys[0]
      yield r.db(_self.dbName).table('images').get(image.id).update({
        publicId: uuid.encode(image.id)
      }).run(connect)

      let created = yield r.db(_self.dbName).table('images').get(image.id).run(connect)

      return Promise.resolve(created)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  likeImage (id, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    const _self = this
    let imageId = uuid.decode(id)

    let tasks = co.wrap(function * () {
      let connect = yield _self.connection

      let image = yield _self.getImage(id)
      yield r.db(_self.dbName).table('images').get(imageId).update({
        likes: image.likes + 1,
        liked: true
      }).run(connect)

      let created = yield _self.getImage(id)

      return Promise.resolve(created)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  getImage (id, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    const _self = this
    const imageId = uuid.decode(id)

    let task = co.wrap(function * () {
      let connect = yield _self.connection
      let image = yield r.db(_self.dbName).table('images').get(imageId).run(connect)

      if (!image) {
        return Promise.reject(new Error(`image ${id} not found`))
      }

      return Promise.resolve(image)
    })

    return Promise.resolve(task()).asCallback(callback)
  }

  getImages (callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    const _self = this

    let task = co.wrap(function * () {
      let connect = yield _self.connection
      let images = yield r.db(_self.dbName).table('images')
        .orderBy({
          index: r.desc('createdAt')
        })
        .run(connect)

      let result = yield images.toArray()
      return Promise.resolve(result)
    })

    return Promise.resolve(task()).asCallback(callback)
  }

  saveUser (user, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    const _self = this

    let tasks = co.wrap(function * () {
      let connect = yield _self.connection
      user.createdAt = new Date()
      user.password = utils.encrypt(user.password)

      let result = yield r.db(_self.dbName).table('users').insert(user).run(connect)

      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }

      user.id = result.generated_keys[0]
      let created = yield r.db(_self.dbName).table('users').get(user.id).run(connect)

      return Promise.resolve(created)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  getUser (username, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    const _self = this

    let tasks = co.wrap(function * () {
      let connect = yield _self.connection

      yield r.db(_self.dbName).table('users').indexWait().run(connect)
      let users = yield r.db(_self.dbName).table('users').getAll(username, {
        index: 'username'
      }).run(connect)

      let result = null
      try {
        result = yield users.next()
      } catch (ex) {
        return Promise.reject(new Error(`user with nameuser ${username} not found`))
      }

      return Promise.resolve(result)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  authenticate (username, password, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    const _self = this
    let tasks = co.wrap(function * () {
      let user = null
      try {
        user = yield _self.getUser(username)
      } catch (ex) {
        return Promise.resolve(false)
      }

      if (user.password === utils.encrypt(password)) {
        return Promise.resolve(true)
      }

      return Promise.resolve(false)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  getImageByUser (id, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    const _self = this
    let tasks = co.wrap(function * () {
      let conn = yield _self.connection

      yield r.db(_self.dbName).table('images').indexWait().run(conn)
      let images = yield r.db(_self.dbName).table('images').getAll(id, {
        index: 'userId'
      }).orderBy(r.desc('createdAt')).run(conn)

      let result = images.toArray()
      return Promise.resolve(result)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

  getImageByTag (tag, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    const _self = this
    tag = utils.normalize(tag)

    let tasks = co.wrap(function * () {
      let conn = yield _self.connection

      yield r.db(_self.dbName).table('images').indexWait().run(conn)
      let images = yield r.db(_self.dbName).table('images').filter(img => {
        return img('tags').contains(tag)
      }).orderBy(r.desc('createdAt')).run(conn)

      let result = images.toArray()
      return Promise.resolve(result)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }
}

module.exports = Database
