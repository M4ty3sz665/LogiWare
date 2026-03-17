const middlewares = require('./middlewares')
const dbHandler = require('./dbHandler')

const ALLOWED_STATUSES = new Set(['TBD', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])

function normalizeStatus(value) {
  if (!value) return null
  const v = String(value).trim().toUpperCase()
  if (v === 'FOLYAMATBAN') return 'IN_PROGRESS'
  if (v === 'TELJESITVE' || v === 'TELJESÍTVE') return 'COMPLETED'
  if (v === 'LEMONDVA' || v === 'TOROLVE' || v === 'TÖRÖLVE') return 'CANCELLED'
  return v
}

async function applyStockDeltaForOrderItems(items, orderId, deltaSign, transaction) {
  // deltaSign: -1 to deduct, +1 to restore
  for (const it of items) {
    const productId = Number(it.product_id)
    const qty = Number(it.amount)
    if (!productId || !Number.isFinite(qty) || qty <= 0) {
      throw new Error('Invalid order items')
    }

    let stockRow = await dbHandler.Stock.findOne({ where: { item_id: productId }, transaction })
    if (!stockRow) {
      stockRow = await dbHandler.Stock.create({ item_id: productId, amount: 0 }, { transaction })
    }

    const current = Number(stockRow.amount || 0)
    const next = current + deltaSign * qty
    await stockRow.update({ amount: next }, { transaction })

    await dbHandler.stockMovements.create(
      {
        stock_id: stockRow.id,
        amount: deltaSign * qty,
        order_id: orderId,
        movement_type: deltaSign === -1 ? 'OUT' : 'IN',
        note: deltaSign === -1 ? 'order created' : 'order cancelled/deleted',
      },
      { transaction },
    )
  }
}

module.exports = function (server) {
  server.get('/order', middlewares.Auth(), async (req, res) => {
    try {
      const rows = await dbHandler.Orders.findAll({
        include: [
          { model: dbHandler.ClientCompanies },
          {
            model: dbHandler.OrderItems,
            include: [{ model: dbHandler.Products }],
          },
        ],
        order: [['order_number', 'DESC']],
      })
      res.json(rows).end()
    } catch (err) {
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })

  // Create order with items and automatic stock deduction.
  // Body: { company_id, payment_method, due_date, due_time?, items:[{product_id, amount}] }
  server.post('/order', middlewares.Auth(), async (req, res) => {
    const items = Array.isArray(req.body.items) ? req.body.items : []
    try {
      if (!req.body.company_id) {
        res.status(400).json({ message: 'Missing company_id' }).end()
        return
      }
      if (!req.body.payment_method) {
        res.status(400).json({ message: 'Missing payment_method' }).end()
        return
      }
      if (!req.body.due_date) {
        res.status(400).json({ message: 'Missing due_date' }).end()
        return
      }
      if (items.length === 0) {
        res.status(400).json({ message: 'Missing items' }).end()
        return
      }

      const created = await dbHandler.sequelize.transaction(async (t) => {
        const order = await dbHandler.Orders.create(
          {
            item_id: Number(items[0]?.product_id || 0),
            company_id: Number(req.body.company_id),
            payment_method: String(req.body.payment_method),
            due_date: req.body.due_date,
            due_time: req.body.due_time,
            status: 'TBD',
            payment_status: 'not processed',
          },
          { transaction: t },
        )

        // Create order items with prices copied from product.
        for (const it of items) {
          const productId = Number(it.product_id)
          const qty = Number(it.amount)
          if (!productId || !Number.isFinite(qty) || qty <= 0) {
            throw new Error('Invalid items')
          }
          const product = await dbHandler.Products.findByPk(productId, { transaction: t })
          if (!product) throw new Error('No such product')

          await dbHandler.OrderItems.create(
            {
              product_id: productId,
              order_id: order.order_number,
              amount: qty,
              unit_price_net: product.price_net,
              unit_price_gross: product.price_gross,
              vat_rate: product.vat_rate,
            },
            { transaction: t },
          )
        }

        // Deduct stock for each item.
        await applyStockDeltaForOrderItems(items, order.order_number, -1, t)
        return order
      })

      res.status(201).json({ message: 'order created', order_number: created.order_number }).end()
    } catch (err) {
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })

  // Update order status with flow enforcement
  server.put('/order/:id/status', middlewares.Auth(), async (req, res) => {
    try {
      const id = Number(req.params.id)
      const next = normalizeStatus(req.body.status)
      if (!ALLOWED_STATUSES.has(next)) {
        res.status(400).json({ message: 'Invalid status' }).end()
        return
      }

      const order = await dbHandler.Orders.findByPk(id)
      if (!order) {
        res.status(404).json({ message: 'No such order' }).end()
        return
      }

      const current = normalizeStatus(order.status) || 'TBD'
      if (current === 'COMPLETED' || current === 'CANCELLED') {
        res.status(400).json({ message: 'Order is final' }).end()
        return
      }

      // Simple flow: TBD -> IN_PROGRESS -> COMPLETED, cancellation allowed from TBD/IN_PROGRESS
      if (next === 'IN_PROGRESS' && current !== 'TBD') {
        res.status(400).json({ message: 'Invalid transition' }).end()
        return
      }
      if (next === 'COMPLETED' && current !== 'IN_PROGRESS') {
        res.status(400).json({ message: 'Invalid transition' }).end()
        return
      }

      if (next === 'CANCELLED') {
        // restore stock only once on cancel
        await dbHandler.sequelize.transaction(async (t) => {
          const items = await dbHandler.OrderItems.findAll({ where: { order_id: id }, transaction: t })
          const plainItems = items.map((i) => ({ product_id: i.product_id, amount: i.amount }))
          await applyStockDeltaForOrderItems(plainItems, id, +1, t)
          await order.update({ status: 'CANCELLED' }, { transaction: t })
        })

        res.status(200).json({ message: 'order cancelled' }).end()
        return
      }

      await order.update({ status: next })
      res.status(200).json({ message: 'status updated' }).end()
    } catch (err) {
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })

  server.put('/order/:id/payment', middlewares.Auth(), async (req, res) => {
    try {
      const id = Number(req.params.id)
      const order = await dbHandler.Orders.findByPk(id)
      if (!order) {
        res.status(404).json({ message: 'No such order' }).end()
        return
      }
      const payload = {}
      if (typeof req.body.payment_status === 'string') payload.payment_status = req.body.payment_status
      if (typeof req.body.payment_method === 'string') payload.payment_method = req.body.payment_method
      await order.update(payload)
      res.status(200).json({ message: 'payment updated' }).end()
    } catch (err) {
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })

  // Delete order (admin): restores stock if not yet cancelled.
  server.delete('/order/:id', middlewares.Auth(), async (req, res) => {
    if (!req.admin) {
      res.status(403).json({ message: 'Forbidden' }).end()
      return
    }
    try {
      const id = Number(req.params.id)
      const order = await dbHandler.Orders.findByPk(id)
      if (!order) {
        res.status(404).json({ message: 'No such order' }).end()
        return
      }

      await dbHandler.sequelize.transaction(async (t) => {
        const current = normalizeStatus(order.status) || 'TBD'
        if (current !== 'CANCELLED') {
          const items = await dbHandler.OrderItems.findAll({ where: { order_id: id }, transaction: t })
          const plainItems = items.map((i) => ({ product_id: i.product_id, amount: i.amount }))
          await applyStockDeltaForOrderItems(plainItems, id, +1, t)
        }
        await dbHandler.OrderItems.destroy({ where: { order_id: id }, transaction: t })
        await order.destroy({ transaction: t })
      })

      res.status(200).json({ message: 'order deleted' }).end()
    } catch (err) {
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })
}
