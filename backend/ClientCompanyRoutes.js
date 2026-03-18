const middlewares = require('./middlewares')
const dbHandler = require('./dbHandler')

module.exports = function (server) {
  server.get(['/clientcompany', '/clientcompany/'], middlewares.Auth(), async (req, res) => {
    try {
      res.json(await dbHandler.ClientCompanies.findAll({ order: [['id', 'DESC']] })).end()
    } catch (err) {
      res.status(500).json({ message: err?.message || 'Server error' }).end()
    }
  })

  server.post(['/clientcompany', '/clientcompany/'], middlewares.Auth(), async (req, res) => {
    try {
      const created = await dbHandler.ClientCompanies.create({
        admitted_at: req.body.admitted_at,
        company_name: req.body.company_name,
        tax_number: req.body.tax_number,
        registration_number: req.body.registration_number,
        address: req.body.address,
        billing_address: req.body.billing_address,
        email: req.body.email,
        phone: req.body.phone,
      })
      res.status(201).json({ message: 'client company successfully added', company: created }).end()
    } catch (err) {
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })
}
