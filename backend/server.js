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

const supplierRoutes = require('./SupplierRoutes')
supplierRoutes(server)

const stockMovementRoutes = require('./StockMovementRoutes')
stockMovementRoutes(server)

const clientCompanyRoutes = require('./ClientCompanyRoutes')
clientCompanyRoutes(server)

const orderRoutes = require('./OrderRoutes')
orderRoutes(server)

const orderItemRoutes = require('./OrderItemRoutes')
orderItemRoutes(server)

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
  if (!products.low_stock_threshold) {
    await qi.addColumn('products', 'low_stock_threshold', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    })
  }

  const stockMovements = await qi.describeTable('stock_movements')
  if (!stockMovements.time_of_movement) {
    await qi.addColumn('stock_movements', 'time_of_movement', {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    })
  }
  if (!stockMovements.note) {
    await qi.addColumn('stock_movements', 'note', {
      type: DataTypes.STRING,
      allowNull: true,
    })
  }
  if (stockMovements.order_id && stockMovements.order_id.allowNull) {
    // keep current schema; we rely on defaultValue=0 in the model
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
