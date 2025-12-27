const db = require("../config/db")

exports.summary = async () => {
  const [[critical]] = await db.query("SELECT COUNT(*) c FROM equipment")
  const [[open]] = await db.query("SELECT COUNT(*) c FROM maintenance_requests WHERE status='NEW'")
  return { critical: critical.c, open: open.c }
}
