const { adapt } = require('../adapters/express-router-adapter')
const RegisterRouterComposer = require('../composers/register-router-composer')

module.exports = router => {
  router.post('/register', adapt(RegisterRouterComposer.compose()))
}
