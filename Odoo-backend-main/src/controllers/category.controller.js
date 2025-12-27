const db = require("../config/db")

exports.list = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM equipment_categories")
  res.json(rows)
}

exports.create = async (req, res) => {
  const { name, responsible, companyId } = req.body
  await db.query(
    "INSERT INTO equipment_categories (name, responsible, company_id) VALUES (?,?,?)",
    [name, responsible, companyId]
  )
  res.json({ success: true })
}
