const cors = require('../middleware/cors')

module.exports = app => {
  app.disable('x-powered-by')
  app.use(cors)
}
