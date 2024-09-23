const registerRouter = require('../composers/register-router-composer')
const ExpressRouterAdapter = require('../adapters/express-router-adapter')

module.exports = router => {
  router.post('/register', ExpressRouterAdapter.adapt(registerRouter))
}
