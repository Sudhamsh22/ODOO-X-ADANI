const db = require("../config/db")

exports.createRequestMeta = async (req, res) => {
  const [equipment] = await db.query("SELECT id, name FROM equipment")
  const [teams] = await db.query("SELECT id, name FROM teams")
  const [technicians] = await db.query("SELECT id, name FROM technicians")

  res.json({ equipment, teams, technicians })
}

exports.createEquipmentMeta = async (req, res) => {
  const [categories] = await db.query("SELECT id, name FROM equipment_categories")
  const [teams] = await db.query("SELECT id, name FROM teams")
  const [technicians] = await db.query("SELECT id, name FROM technicians")
  const [employees] = await db.query("SELECT id, name FROM employees")
  const [workCenters] = await db.query("SELECT id, name FROM work_centers")

  res.json({ categories, teams, technicians, employees, workCenters })
}
