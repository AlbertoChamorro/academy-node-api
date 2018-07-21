'use strict'

const r = require('rethinkdb')
const co = require('co')
const uuid = require('uuid-base62')
const Promise = require('bluebird')
const utils = require('../common/utils')

const defaults = {
  host: 'localhost',
  port: 28015,
  db: 'academy_db'
}

class Database {
  constructor (options = {}) {
    this.host = options.host || defaults.host
    this.port = options.port || defaults.port
    this.dbName = options.db || defaults.db
  }

  connect (callback) {
    let _self = this
    _self.connection = r.connect({
      host: _self.host,
      port: _self.port
    })

    this.connected = true

    const setup = co.wrap(function * () {
      let connect = yield _self.connection
      let dbList = yield r.dbList().run(connect)

      if (dbList.indexOf(_self.dbName) === -1) {
        yield r.dbCreate(_self.dbName).run(connect)
      }

      let dbTables = yield r.db(_self.dbName).tableList().run(connect)

      if (dbTables.indexOf('images') === -1) {
        yield r.db(_self.dbName).tableCreate('images').run(connect)
      }

      if (dbTables.indexOf('users') === -1) {
        yield r.db(_self.dbName).tableCreate('users').run(connect)
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
        public_path: uuid.encode(image.id)
      }).run(connect)

      let created = yield r.db(_self.dbName).table('images').get(image.id).run(connect)

      return Promise.resolve(created)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }
}

module.exports = Database
