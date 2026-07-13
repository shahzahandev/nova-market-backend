const jwt = require('jsonwebtoken')

let tokenGenerator = (data, secret, expire) => {
      // <=== Token Genarate ===>
    let token = jwt.sign(data, secret, {
       expiresIn: expire
      })
      return token
}

module.exports = {tokenGenerator}