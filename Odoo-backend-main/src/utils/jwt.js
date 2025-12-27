const jwt = require("jsonwebtoken")
const { jwtSecret } = require("../config/env")

exports.sign = id => jwt.sign({ id }, jwtSecret, { expiresIn: "7d" })
exports.verify = token => jwt.verify(token, jwtSecret)
