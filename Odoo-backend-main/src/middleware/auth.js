const jwt = require("../utils/jwt")

module.exports = (req, res, next) => {
  const h = req.headers.authorization
  if (!h) return res.sendStatus(401)
  const token = h.split(" ")[1]
  try {
    req.user = jwt.verify(token)
    next()
  } catch {
    res.sendStatus(401)
  }
}
