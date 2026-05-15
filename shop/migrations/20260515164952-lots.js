module.exports = {
  async up(db) {
    await db.createCollection('lots')
    await db.collection('lots').createIndex({ status: 1 })
    await db.collection('lots').createIndex({ userId: 1 })
  },

  async down(db) {
    await db.collection('lots').drop()
  },
}
