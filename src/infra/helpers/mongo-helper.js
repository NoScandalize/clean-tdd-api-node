const { MongoClient } = require('mongodb')

module.exports = {
  async connect (uri) {
    this.client = await MongoClient.connect(uri)
    this.db = this.client.db()
  },

  async disconnect () {
    await this.client.close()
  },

  async getCollection (name) {
    return this.db.collection(name)
  }
}
