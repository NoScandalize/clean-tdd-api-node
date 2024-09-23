const registerRouter = require('../composers/register-router-composer')

module.exports = router => {
  router.post('/register', registerRouter)
}
