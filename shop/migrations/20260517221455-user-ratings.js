module.exports = {
  async up(db) {
    await db.collection('users').updateMany(
      { sellerRating: { $exists: false } },
      {
        $set: {
          sellerRating: 0,
          sellerRatingsCount: 0,
          buyerRating: 0,
          buyerRatingsCount: 0,
        },
        $unset: { rating: '' },
      }
    )
  },

  async down(db) {
    await db.collection('users').updateMany(
      {},
      {
        $set: { rating: 0 },
        $unset: {
          sellerRating: '',
          sellerRatingsCount: '',
          buyerRating: '',
          buyerRatingsCount: '',
        },
      }
    )
  },
}
