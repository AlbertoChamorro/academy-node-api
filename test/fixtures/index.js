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
      userId: uuid.uuid()
    }
  },
  getImages (count) {
    let images = []
    while (count-- > 0) {
      images.push(this.getImage())
    }
    return images
  },
  getUser () {
    return {
      name: 'A random user',
      username: `user_${uuid.v4()}`,
      password: uuid.v4(),
      email: `${uuid.v4()}@gmail.test`
    }
  }
}

module.exports = fixtures
