const middlewares = require('./middlewares')
const dbHandler = require('./dbHandler')

module.exports = function (server) {
  server.get('/stockmovement', async (req, res) => {
    try {
      const rows = await dbHandler.stockMovements.findAll({
        include: [
          {
            model: dbHandler.Stock,
            include: [
              {
                model: dbHandler.Products,
                attributes: ['id', 'name', 'product_code'],
              },
            ],
          },
        ],
        order: [['id', 'DESC']],
      })
      res.json(rows).end()
    } catch (err) {
      res.status(500).json({ message: err?.message || 'Server error' }).end()
    }
  })

  server.post('/stockmovement', middlewares.Auth(), async (req, res) => {
    try {
      const created = await dbHandler.stockMovements.create({
        stock_id: req.body.stock_id,
        amount: req.body.amount,
        order_id: req.body.order_id ?? 0,
        time_of_movement: req.body.time_of_movement,
        movement_type: req.body.movement_type,
        note: req.body.note,
      })
      res.status(201).json({ message: 'movement successfully added', movement: created }).end()
    } catch (err) {
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })

  server.delete('/stockmovement/:id', middlewares.Auth(), async (req, res) => {
    if (!req.admin) {
      res.status(403).json({ message: 'Forbidden' }).end()
      return
    }
    try {
      const one = await dbHandler.stockMovements.findByPk(req.params.id)
      if (!one) {
        res.status(404).json({ message: 'No such movement' }).end()
        return
      }
      await one.destroy()
      res.status(200).json({ message: 'movement deleted' }).end()
    } catch (err) {
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })
}
