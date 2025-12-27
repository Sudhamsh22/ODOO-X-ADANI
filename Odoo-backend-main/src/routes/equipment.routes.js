const router = require("express").Router()
const c = require("../controllers/equipment.controller")

router.get("/", c.list)
router.post("/", c.create)

module.exports = router
