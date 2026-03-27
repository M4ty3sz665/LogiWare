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

  const orders = await qi.describeTable('orders')
  if (!orders.user_id) {
    await qi.addColumn('orders', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
    })
  }

  // Legacy cleanup: remove old client-company schema artifacts.
  try {
    await dbHandler.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')

    if (products.low_stock_threshold) {
      await qi.removeColumn('products', 'low_stock_threshold')
    }

    if (orders.company_id) {
      await qi.removeColumn('orders', 'company_id')
    }

    const receipts = await qi.describeTable('receipts')
    if (receipts.company_id) {
      await qi.removeColumn('receipts', 'company_id')
    }

    const tables = await qi.showAllTables()
    const names = tables.map((t) => (typeof t === 'string' ? t : t.tableName || Object.values(t)[0]))
    if (names.includes('client_companies')) {
      await qi.dropTable('client_companies')
    }
  } catch (e) {
    console.log('Legacy company cleanup skipped:', e?.parent?.sqlMessage || e?.message || e)
  } finally {
    await dbHandler.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
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
