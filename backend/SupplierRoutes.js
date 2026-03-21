const middlewares = require('./middlewares')
const dbHandler = require('./dbHandler')

module.exports = function (server) {
  server.get('/supplier', async (req, res) => {
    try {
      res.json(await dbHandler.Suppliers.findAll({ order: [['id', 'DESC']] })).end()
    } catch (err) {
      res.status(500).json({ message: err?.message || 'Server error' }).end()
    }
  })

  server.post('/supplier', middlewares.Auth(), async (req, res) => {
    try {
      const created = await dbHandler.Suppliers.create({
        company_name: req.body.company_name,
        tax_number: req.body.tax_number,
        registration_number: req.body.registration_number,
        address: req.body.address,
        billing_address: req.body.billing_address,
        email: req.body.email,
        phone: req.body.phone,
      })
      res.status(201).json({ message: 'supplier successfully added', supplier: created }).end()
    } catch (err) {
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })

  server.put('/supplier/:id', middlewares.Auth(), async (req, res) => {
    try {
      const one = await dbHandler.Suppliers.findByPk(req.params.id)
      if (!one) {
        res.status(404).json({ message: 'No such supplier exists' }).end()
        return
      }

      await one.update({
        company_name: req.body.company_name ?? one.company_name,
        tax_number: req.body.tax_number ?? one.tax_number,
        registration_number: req.body.registration_number ?? one.registration_number,
        address: req.body.address ?? one.address,
        billing_address: req.body.billing_address ?? one.billing_address,
        email: req.body.email ?? one.email,
        phone: req.body.phone ?? one.phone,
      })

      res.status(200).json({ message: 'supplier successfully updated' }).end()
    } catch (err) {
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })

  server.delete('/supplier/:id', middlewares.Auth(), async (req, res) => {
    if (!req.admin) {
      res.status(403).json({ message: 'Forbidden' }).end()
      return
    }
    try {
      const one = await dbHandler.Suppliers.findByPk(req.params.id)
      if (!one) {
        res.status(404).json({ message: 'No such supplier' }).end()
        return
      }
      await one.destroy()
      res.status(200).json({ message: 'supplier deleted' }).end()
    } catch (err) {
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })
}
