const router = require("express").Router()
const db = require("../config/db")

router.get("/", async (req,res)=>{
  const [rows] = await db.query("SELECT * FROM equipment_categories")
  res.json(rows)
})

router.post("/", async (req,res)=>{
  const {name,responsible,companyId} = req.body
  await db.query("INSERT INTO equipment_categories (name,responsible,company_id) VALUES (?,?,?)",[name,responsible,companyId])
  res.json({ success:true })
})

module.exports = router
