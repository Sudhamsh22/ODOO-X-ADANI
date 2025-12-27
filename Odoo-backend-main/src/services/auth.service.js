const db = require("../config/db")
const bcrypt = require("bcrypt")
const jwt = require("../utils/jwt")

exports.signup = async ({fullName,email,password}) => {
  const hash = await bcrypt.hash(password,10)
  await db.query("INSERT INTO users (full_name,email,password) VALUES (?,?,?)",[fullName,email,hash])
  return { success:true }
}

exports.login = async ({email,password}) => {
  const [[user]] = await db.query("SELECT * FROM users WHERE email=?",[email])
  if(!user) throw new Error()
  const ok = await bcrypt.compare(password,user.password)
  if(!ok) throw new Error()
  return { token: jwt.sign(user.id) }
}
