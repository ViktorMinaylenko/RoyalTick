// eslint-disable-next-line @typescript-eslint/no-var-requires
const { faker } = require('@faker-js/faker')

const getRandomArrayValue = (arr) => arr[Math.floor(Math.random() * arr.length)]

const types = [
  'leather_strap',
  'metal_bracelet',
  'rubber_strap',
  'nato_strap',
  'mesh_bracelet',
]

const colors = ['black', 'brown', 'blue', 'green', 'red', 'white', 'gray']
const lengths = [180, 200, 220, 240]
const widths = [18, 20, 22, 24]
const claspTypes = ['buckle', 'deployant', 'folding', 'pin']
const textures = ['smooth', 'embossed', 'woven', 'stitched']
const patterns = ['plain', 'patterned', 'stitch detail', 'perforated']

const images = [
  '/img/straps/strap-leather-1.png',
  '/img/straps/strap-leather-2.png',
  '/img/straps/strap-rubber-1.png',
  '/img/straps/strap-steel-1.png',
  '/img/straps/strap-silicone-1.png',
]

module.exports = {
  async up(db) {
    return db.collection('straps').insertMany(
      [...Array(50)].map(() => {
        const type = getRandomArrayValue(types)

        const characteristics = [
          {
            type: 'leather_strap',
            collection: getRandomArrayValue(['classic', 'premium', 'casual']),
            material: 'leather',
            claspType: getRandomArrayValue(claspTypes),
            texture: getRandomArrayValue(textures),
            pattern: getRandomArrayValue(patterns),
            waterResistant: faker.datatype.boolean(),
          },
          {
            type: 'metal_bracelet',
            collection: getRandomArrayValue(['classic', 'mesh', 'premium']),
            material: 'steel',
            claspType: getRandomArrayValue(claspTypes),
            texture: getRandomArrayValue(textures),
            pattern: getRandomArrayValue(patterns),
            waterResistant: faker.datatype.boolean(),
          },
          {
            type: 'rubber_strap',
            collection: getRandomArrayValue(['sport', 'casual']),
            material: 'rubber',
            claspType: getRandomArrayValue(claspTypes),
            texture: getRandomArrayValue(textures),
            pattern: getRandomArrayValue(patterns),
            waterResistant: faker.datatype.boolean(),
          },
          {
            type: 'nato_strap',
            collection: getRandomArrayValue(['casual', 'urban']),
            material: 'fabric',
            claspType: getRandomArrayValue(claspTypes),
            texture: getRandomArrayValue(textures),
            pattern: getRandomArrayValue(patterns),
            waterResistant: faker.datatype.boolean(),
          },
          {
            type: 'mesh_bracelet',
            collection: getRandomArrayValue(['classic', 'premium']),
            material: 'steel',
            claspType: getRandomArrayValue(claspTypes),
            texture: getRandomArrayValue(textures),
            pattern: getRandomArrayValue(patterns),
            waterResistant: faker.datatype.boolean(),
          },
        ]

        const currentCharacteristics = characteristics.find(
          (item) => item.type === type
        )

        return {
          category: 'straps',
          type,
          price: +faker.string.numeric(4).replace(/.{0,2}$/, 99),
          name: `${getRandomArrayValue(colors)} ${type}`,
          description: faker.lorem.sentences(3),
          characteristics: currentCharacteristics,
          images: [getRandomArrayValue(images)],
          vendorCode: faker.string.alphanumeric(6).toUpperCase(),
          inStock: +faker.string.numeric(2),
          isBestseller: faker.datatype.boolean(),
          isNew: faker.datatype.boolean(),
          popularity: +faker.string.numeric(3),
          sizes: {
            '180 / 18': faker.datatype.boolean(),
            '200 / 20': faker.datatype.boolean(),
            '220 / 22': faker.datatype.boolean(),
            '240 / 24': faker.datatype.boolean(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })
    )
  },

  async down(db) {
    return db.collection('straps').deleteMany({})
  },
}
