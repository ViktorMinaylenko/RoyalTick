module.exports = {
  async up(db) {
    await db
      .collection('users')
      .updateMany(
        { followers: { $exists: false } },
        { $set: { followers: [], following: [] } }
      )
  },
  async down(db) {
    await db
      .collection('users')
      .updateMany({}, { $unset: { followers: '', following: '' } })
  },
}
