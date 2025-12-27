const router = require("express").Router()
const db = require("../config/db")

router.get("/", async (req,res)=>{
  const [teams] = await db.query("SELECT * FROM teams")
  res.json(teams)
})

router.post("/", async (req,res)=>{
  const {name,companyId,members} = req.body
  const [r] = await db.query("INSERT INTO teams (name,company_id) VALUES (?,?)",[name,companyId])
  for(const m of members){
    await db.query("INSERT INTO team_members (team_id,technician_id) VALUES (?,?)",[r.insertId,m])
  }
  res.json({ success:true })
})

module.exports = router
