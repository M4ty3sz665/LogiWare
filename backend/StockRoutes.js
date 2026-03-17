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
      res.json(rows).end()
    } catch (err) {
      res
        .status(500)
        .json({ message: err?.message || 'Failed to load stock' })
        .end()
    }
  })

  server.post('/stock', middlewares.Auth(), async (req, res) => {
    const created = await dbHandler.Stock.create({
      item_id: req.body.item_id,
      amount: req.body.amount,
      created_at: req.body.created_at,
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
