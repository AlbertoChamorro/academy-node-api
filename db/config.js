'use strict'

const r = require('rethinkdb')
const co = require('co')
const Promise = require('bluebird')

const defaults = {
  host: 'localhost',
  port: 28015,
  db: 'academy_db'
}

class Database {
  constructor (options = {}) {
    this.host = options.host || defaults.host
    this.port = options.port || defaults.port
    this.db = options.db || defaults.db
  }

  connect (callback) {
    let self = this
    self.connection = r.connect({
      host: self.port,
      port: self.port
    })

    this.connected = true

    const setup = co.wrap(function * () {
      let connect = yield self.connection
      let dbList = yield r.dbList().run(connect)

      if (dbList.indexOf(self.db) === -1) {
        yield r.dbCreate(self.db).run(connect)
      }

      let dbTables = yield r.db(self.db).tableList().run(connect)

      if (dbTables.indexOf('images') === -1) {
        yield r.db(self.db).tableCreate('images').run(connect)
      }

      if (dbTables.indexOf('users') === -1) {
        yield r.db(self.db).tableCreate('users').run(connect)
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

      let result = yield r.db(_self.db).table('images').insert(image).run(connect)

      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }
      image.id = result.generated_keys[0]
      return Promise.resolve(image)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }
}

module.exports = Database
