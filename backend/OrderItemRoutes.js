const middlewares = require('./middlewares')
const dbHandler = require('./dbHandler')

module.exports = function (server) {
  server.get('/orderitem', middlewares.Auth(), async (req, res) => {
    try {
      const rows = await dbHandler.OrderItems.findAll({
        include: [{ model: dbHandler.Products }, { model: dbHandler.Orders }],
        order: [['id', 'DESC']],
      })
      res.json(rows).end()
    } catch (err) {
      res.status(500).json({ message: err?.parent?.sqlMessage || err?.message || 'Server error' }).end()
    }
  })
}
