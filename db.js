const { MongoClient } = require('mongodb')

async function database () {
  const client = await MongoClient.connect('mongodb://localhost:27017')
  return client.db('chatapp')
}

module.exports = database
