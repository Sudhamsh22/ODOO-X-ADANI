const db = require("../config/db")

exports.list = async (req,res) => {
  const [rows] = await db.query("SELECT * FROM equipment")
  res.json(rows)
}

exports.create = async (req,res) => {
  const d = req.body
  await db.query(
    "INSERT INTO equipment (name,category_id,serial_number,technician_id,employee_id,team_id,work_center_id,description) VALUES (?,?,?,?,?,?,?,?)",
    [d.name,d.categoryId,d.serialNumber,d.technicianId,d.employeeId,d.teamId,d.workCenterId,d.description]
  )
  res.json({ success:true })
}
