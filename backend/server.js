const express = require("express")
const server = express()
server.use(express.static("public"))
const dbHandler = require("./dbHandler")
server.use(express.json())
require("dotenv").config()
const PORT = process.env.PORT
const userRoutes = require('./UserRoutes')
userRoutes(server)
const productRoutes = require('./ProductRoutes')
productRoutes(server)
const stockRoutes = require('./StockRoutes')
stockRoutes(server)

const { DataTypes } = require('sequelize')

async function ensureSchema() {
  const qi = dbHandler.sequelize.getQueryInterface()

  // Keep this lightweight: only add missing columns we rely on.
  const products = await qi.describeTable('products')
  if (!products.supplier_id) {
    await qi.addColumn('products', 'supplier_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
    })
  }
}

async function start() {
  try {
    await ensureSchema()
  } catch (e) {
    console.log('Schema ensure failed:', e?.parent?.sqlMessage || e?.message || e)
  }
  server.listen(PORT, () => {
    console.log('server is running on port ' + PORT)
  })
}

start()

module.exports = {server}
