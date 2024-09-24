module.exports = class ExpressRouterAdapter {
  static adapt (router) {
    return async (req, res) => {
      const httpRequest = {
        body: req.body
      }
      const httpResponse = await router.exec(httpRequest)
      res.status(httpResponse.statusCode).json(httpResponse.body)
    }
  }
}
