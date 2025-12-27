const router = require("express").Router()
const db = require("../config/db")

router.get("/create-request", async (req,res)=>{
  const [equipment] = await db.query("SELECT id,name FROM equipment")
  const [teams] = await db.query("SELECT id,name FROM teams")
  const [technicians] = await db.query("SELECT id,name FROM technicians")
  res.json({ equipment, teams, technicians })
})

module.exports = router
