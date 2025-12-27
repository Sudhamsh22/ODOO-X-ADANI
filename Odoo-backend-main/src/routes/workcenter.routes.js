const router = require("express").Router()
const db = require("../config/db")

router.get("/", async (req,res)=>{
  const [rows] = await db.query("SELECT * FROM work_centers")
  res.json(rows)
})

router.post("/", async (req,res)=>{
  const d = req.body
  await db.query(
    "INSERT INTO work_centers (name,department,description,tag,alternatives,cost_per_hour,capacity_percentage,oee_target) VALUES (?,?,?,?,?,?,?,?)",
    [d.name,d.department,d.description,d.tag,d.alternatives,d.costPerHour,d.capacity,d.oee]
  )
  res.json({ success:true })
})

module.exports = router
