module.exports = {
  async up(db) {
    await db
      .collection('users')
      .updateMany(
        { sellerReviews: { $exists: false } },
        { $set: { sellerReviews: [], buyerReviews: [] } }
      )
    await db.collection('chats').updateMany(
      { dealCompletedByOwner: { $exists: false } },
      {
        $set: {
          dealCompletedByOwner: false,
          dealCompletedByWinner: false,
          ownerRatedBuyer: false,
          winnerRatedSeller: false,
        },
      }
    )
  },
  async down(db) {
    await db
      .collection('users')
      .updateMany({}, { $unset: { sellerReviews: '', buyerReviews: '' } })
  },
}
