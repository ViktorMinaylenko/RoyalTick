module.exports = {
  async up(db) {
    await db.createCollection('topics')
    await db.collection('topics').createIndex({ createdAt: -1 })
    await db.collection('topics').createIndex({ category: 1 })
    await db.collection('topics').createIndex({ userId: 1 })
  },
  async down(db) {
    await db.collection('topics').drop()
  },
}
