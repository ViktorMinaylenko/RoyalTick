module.exports = {
  async up(db) {
    await db
      .collection('lots')
      .updateMany({ comments: { $exists: false } }, { $set: { comments: [] } })
  },
  async down(db) {
    await db.collection('lots').updateMany({}, { $unset: { comments: '' } })
  },
}
