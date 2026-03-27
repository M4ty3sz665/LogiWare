const middlewares = require("./middlewares")
const dbHandler = require('./dbHandler')

module.exports = function (server) {
  server.get('/stock', async (req, res) => {
    try {
      // Include product so frontend can show names/codes without extra call
      const rows = await dbHandler.Stock.findAll({
        include: [
          {
            model: dbHandler.Products,
            attributes: ['id', 'name', 'price_net', 'price_gross', 'vat_rate', 'product_code'],
          },
        ],
        order: [['id', 'DESC']],
      })

      // Normalize output so the frontend always has easy fields,
      // even if the JOIN is missing (no matching product).
      const normalized = rows.map((r) => {
        const plain = r.toJSON ? r.toJSON() : r
        const product = plain.product || null
        return {
          ...plain,
          product_name: product?.name ?? null,
          product_code: product?.product_code ?? null,
          missing_product: !product,
        }
      })

      res.json(normalized).end()
    } catch (err) {
      res
        .status(500)
        .json({ message: err?.message || 'Failed to load stock' })
        .end()
    }
  })

  // Inventory operation: IN/OUT/ADJUST for a product.
  // Body: { product_id, type: 'IN'|'OUT'|'ADJUST', amount, note?, time_of_movement? }
  server.post('/inventory/move', middlewares.Auth(), async (req, res) => {
    try {
      const productId = Number(req.body.product_id)
      const type = String(req.body.type || '').toUpperCase()
      const amount = Number(req.body.amount)
      const note = req.body.note
      const time = req.body.time_of_movement

      if (!productId || Number.isNaN(productId)) {
        res.status(400).json({ message: 'Missing product_id' }).end()
        return
      }
      if (!['IN', 'OUT', 'ADJUST'].includes(type)) {
        res.status(400).json({ message: 'Invalid type' }).end()
        return
      }
      if (!Number.isFinite(amount) || amount < 0) {
        res.status(400).json({ message: 'Invalid amount' }).end()
        return
      }

      const product = await dbHandler.Products.findByPk(productId)
      if (!product) {
        res.status(404).json({ message: 'No such product' }).end()
        return
      }

      // Ensure a stock row exists for this product.
      let stockRow = await dbHandler.Stock.findOne({ where: { item_id: productId } })
      if (!stockRow) {
        stockRow = await dbHandler.Stock.create({ item_id: productId, amount: 0 })
      }

      const current = Number(stockRow.amount || 0)
      let newAmount = current
      let movementAmount = amount

      if (type === 'IN') {
        newAmount = current + amount
        movementAmount = amount
      } else if (type === 'OUT') {
        newAmount = current - amount
        movementAmount = -amount
      } else if (type === 'ADJUST') {
        newAmount = amount
        movementAmount = amount - current
      }

      await stockRow.update({ amount: newAmount })

      const movement = await dbHandler.stockMovements.create({
        stock_id: stockRow.id,
        amount: movementAmount,
        order_id: 0,
        movement_type: type,
        time_of_movement: time,
        note,
      })

      res.status(201).json({ message: 'inventory updated', stock: stockRow, movement }).end()
    } catch (err) {
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })

  server.post('/stock', middlewares.Auth(), async (req, res) => {
    const created = await dbHandler.Stock.create({
      item_id: req.body.item_id,
      amount: req.body.amount,
    })
    res.status(201).json({ message: 'stock successfully added', stock: created }).end()
  })

  server.put('/stock/:id', middlewares.Auth(), async (req, res) => {
    const onestock = await dbHandler.Stock.findByPk(req.params.id)
    if (!onestock) {
      res.status(404).json({ message: 'No such stock exists' }).end()
      return
    }

    await onestock.update({
      item_id: req.body.item_id ?? onestock.item_id,
      amount: req.body.amount ?? onestock.amount,
      created_at: req.body.created_at ?? onestock.created_at,
    })
    res.status(200).json({ message: 'stock successfully updated' }).end()
  })

  server.delete('/stock/:id', middlewares.Auth(), async (req, res) => {
    if (!req.admin) {
      res.status(403).json({ message: 'Forbidden' }).end()
      return
    }

    const onestock = await dbHandler.Stock.findByPk(req.params.id)
    if (!onestock) {
      res.status(404).json({ message: 'No such stock' }).end()
      return
    }

    await onestock.destroy()
    res.status(200).json({ message: 'stock deleted' }).end()
  })
}
