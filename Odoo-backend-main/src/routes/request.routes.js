const router = require("express").Router()
const c = require("../controllers/request.controller")

router.get("/", c.list)
router.post("/", c.create)
router.patch("/:id/status", c.updateStatus)

module.exports = router
