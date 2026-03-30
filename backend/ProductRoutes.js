const middlewares = require("./middlewares")
const dbHandler = require('./dbHandler')

module.exports = function (server) {
  server.get('/product', async (req, res) => {
    try {
      res.json(await dbHandler.Products.findAll()).end()
    } catch (err) {
      console.log('GET /product failed:', err?.parent?.sqlMessage || err?.message || err)
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })

  server.post('/product', middlewares.Auth(), async (req, res) => {
    const existing = await dbHandler.Products.findOne({
      where: {
        name: req.body.name,
      },
    })

    if (existing) {
      res.status(400).json({ message: 'A product with this name already exists' }).end()
      return
    }

    await dbHandler.Products.create({
      name: req.body.name,
      price_net: req.body.price_net,
      price_gross: req.body.price_gross,
      vat_rate: req.body.vat_rate,
      supplier_id: req.body.supplier_id ?? null,
      low_stock_threshold: req.body.low_stock_threshold ?? 0,
    })

    res.status(201).json({ message: 'Product successfully added' }).end()
  })

  server.put('/product/:id', middlewares.Auth(), async (req, res) => {
    const oneProduct = await dbHandler.Products.findByPk(req.params.id)
    if (!oneProduct) {
      res.status(404).json({ message: 'No such product exists' }).end()
      return
    }

    await oneProduct.update({
      name: req.body.name,
      price_net: req.body.price_net,
      price_gross: req.body.price_gross,
      vat_rate: req.body.vat_rate,
      product_code: req.body.product_code,
      supplier_id: req.body.supplier_id ?? oneProduct.supplier_id,
      low_stock_threshold: req.body.low_stock_threshold ?? oneProduct.low_stock_threshold,
    })

    res.status(200).json({ message: 'Product successfully updated' }).end()
  })

  server.delete('/product/:id', middlewares.Auth(), async (req, res) => {
    if (!req.admin) {
      res.status(403).json({ message: 'Forbidden' }).end()
      return
    }

    const oneProduct = await dbHandler.Products.findByPk(req.params.id)
    if (!oneProduct) {
      res.status(404).json({ message: 'No such product' }).end()
      return
    }

    await oneProduct.destroy()
    res.status(200).json({ message: 'product deleted' }).end()
  })
}
