const express = require("express")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/auth", require("./routes/auth.routes"))
app.use("/api/dashboard", require("./routes/dashboard.routes"))
app.use("/api/requests", require("./routes/request.routes"))
app.use("/api/equipment", require("./routes/equipment.routes"))
app.use("/api/categories", require("./routes/category.routes"))
app.use("/api/teams", require("./routes/team.routes"))
app.use("/api/workcenters", require("./routes/workcenter.routes"))
app.use("/api/meta", require("./routes/meta.routes"))

module.exports = app
