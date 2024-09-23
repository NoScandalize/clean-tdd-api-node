const { MongoClient } = require('mongodb')

module.exports = {
  async connect (uri, dbName) {
    this.client = await MongoClient.connect(uri)
    this.db = this.client.db(dbName)
  },

  async disconnect () {
    await this.client.close()
  },

  async getCollection (name) {
    if (!this.client) {
      await this.connect(this.uri, this.dbName)
    }
    return this.db.collection(name)
  }
}
