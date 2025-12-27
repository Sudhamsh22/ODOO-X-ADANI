const db = require("../config/db")

exports.list = async (req, res) => {
  const [teams] = await db.query("SELECT * FROM teams")
  const [members] = await db.query(
    "SELECT tm.team_id, t.id, t.name FROM team_members tm JOIN technicians t ON tm.technician_id = t.id"
  )

  const result = teams.map(team => ({
    ...team,
    members: members.filter(m => m.team_id === team.id).map(m => ({
      id: m.id,
      name: m.name
    }))
  }))

  res.json(result)
}

exports.create = async (req, res) => {
  const { name, companyId, members } = req.body
  const [r] = await db.query(
    "INSERT INTO teams (name, company_id) VALUES (?,?)",
    [name, companyId]
  )

  if (Array.isArray(members)) {
    for (const m of members) {
      await db.query(
        "INSERT INTO team_members (team_id, technician_id) VALUES (?,?)",
        [r.insertId, m]
      )
    }
  }

  res.json({ success: true })
}
