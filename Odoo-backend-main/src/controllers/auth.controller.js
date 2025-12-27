const s = require("../services/auth.service")

exports.signup = async (req,res) => {
  const data = await s.signup(req.body)
  res.json(data)
}

exports.login = async (req,res) => {
  const data = await s.login(req.body)
  res.json(data)
}
