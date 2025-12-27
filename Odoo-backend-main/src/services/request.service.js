const db = require("../config/db")

exports.list = async () => {
  const [rows] = await db.query("SELECT * FROM maintenance_requests")
  return rows
}

exports.create = async data => {
  await db.query(
    "INSERT INTO maintenance_requests (title,equipment_id,type,priority,status,due_date,team_id,technician_id,notes) VALUES (?,?,?,?,?,?,?,?,?)",
    [data.subject,data.equipmentId,data.type,data.priority,"NEW",data.dueDate,data.teamId,data.technicianId,data.notes]
  )
  return { success:true }
}

exports.updateStatus = async (id,status) => {
  await db.query("UPDATE maintenance_requests SET status=? WHERE id=?",[status,id])
  return { success:true }
}
