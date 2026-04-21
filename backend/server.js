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
  dbHandler.Orders.sync({force:true})
  const qi = dbHandler.sequelize.getQueryInterface()
/*  dbHandler.Stock.sync({force:true})
  dbHandler.Orders.sync({force:true})
  dbHandler.Suppliers.sync({force:true})
  dbHandler.OrderItems.sync({force:true})*/
  // Keep this lightweight: only add missing columns we rely on.
  const products = await qi.describeTable('products')
  if (!products.supplier_id) {
    await qi.addColumn('products', 'supplier_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
    })
  }
  if (!products.category) {
    await qi.addColumn('products', 'category', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'zoldseg',
    })
  }
  // Backfill category for existing products (idempotent).
  // We use product_code prefixes where available (FR-* fruit, VG-* vegetable),
  // and fall back to a small name-based list.
  try {
    await dbHandler.sequelize.query(
      "UPDATE products SET category='gyumolcs' WHERE (category IS NULL OR category='' OR category='zoldseg') AND (product_code LIKE 'FR-%' OR LOWER(name) IN ('alma','banán','banan','narancs','eper','szőlő','szolo'))",
    )
    await dbHandler.sequelize.query(
      "UPDATE products SET category='zoldseg' WHERE (category IS NULL OR category='') AND (product_code LIKE 'VG-%' OR LOWER(name) IN ('krumpli','vörös hagyma','voros hagyma','répa','repa','paradicsom','uborka'))",
    )
  } catch (e) {
    console.log('Category backfill skipped:', e?.parent?.sqlMessage || e?.message || e)
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
  await qi.changeColumn('stock_movements', 'amount', {
    type: DataTypes.DECIMAL(10, 1),
    allowNull: false,
    defaultValue: 0.0,
  })

  const orders = await qi.describeTable('orders')
  if (!orders.user_id) {
    await qi.addColumn('orders', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
    })
  }

  await qi.changeColumn('stocks', 'amount', {
    type: DataTypes.DECIMAL(10, 1),
    allowNull: false,
    defaultValue: 0.0,
  })
  await qi.changeColumn('order_items', 'amount', {
    type: DataTypes.DECIMAL(10, 1),
    allowNull: false,
    defaultValue: 0.1,
  })

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
