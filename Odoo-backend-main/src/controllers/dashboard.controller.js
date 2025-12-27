const s = require("../services/dashboard.service")

exports.summary = async (req,res) => {
  const data = await s.summary()
  res.json(data)
}
