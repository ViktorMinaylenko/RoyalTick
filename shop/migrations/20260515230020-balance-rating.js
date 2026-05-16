// migrations/20260516120000-user-balance-rating.js
module.exports = {
  async up(db) {
    await db
      .collection('users')
      .updateMany(
        { balance: { $exists: false } },
        { $set: { balance: 0, rating: 0 } }
      )
  },

  async down(db) {
    await db
      .collection('users')
      .updateMany({}, { $unset: { balance: '', rating: '' } })
  },
}
