module.exports = {
  async up(db) {
    await db.createCollection('chats')
    await db.collection('chats').createIndex({ winnerId: 1 })
    await db.collection('chats').createIndex({ ownerId: 1 })
    await db.collection('chats').createIndex({ lotId: 1 }, { unique: true })
  },
  async down(db) {
    await db.collection('chats').drop()
  },
}
