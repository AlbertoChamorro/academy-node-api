'use strict'
const uuid = require('uuid-base62')
// 'http://programaenlinea.net/wp-content/uploads/2018/02/developer-3.jpg',

const fixtures = {
  getImage () {
    return {
      description: '#awesome good code #123Store',
      url: `http://programaenlinea.net/wp-content/uploads/2018/02/${uuid.uuid()}.jpg`,
      likes: 0,
      liked: false,
      user_id: uuid.uuid()
    }
  }
}

module.exports = fixtures
