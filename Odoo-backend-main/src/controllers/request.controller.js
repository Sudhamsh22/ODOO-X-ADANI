const s = require("../services/request.service")

exports.list = async (req,res) => {
  res.json(await s.list())
}

exports.create = async (req,res) => {
  res.json(await s.create(req.body))
}

exports.updateStatus = async (req,res) => {
  res.json(await s.updateStatus(req.params.id,req.body.status))
}
