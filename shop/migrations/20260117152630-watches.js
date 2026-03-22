// eslint-disable-next-line @typescript-eslint/no-var-requires
const { faker } = require('@faker-js/faker')

const getRandomArrayValue = (arr) => arr[Math.floor(Math.random() * arr.length)]

const brands = ['casio', 'seiko', 'orient', 'citizen', 'tissot']
const collections = ['classic', 'sport', 'premium', 'line', 'urban', 'chrono']
const genders = ['men', 'women', 'unisex']
const mechanisms = ['quartz', 'mechanical', 'automatic']
const glassTypes = ['mineral', 'sapphire']
const caseMaterials = ['steel', 'plastic', 'titanium']
const strapMaterials = ['leather', 'rubber', 'steel']
const caseColors = ['black', 'silver', 'gold', 'green', 'blue', 'white']
const dialColors = ['black', 'white', 'blue', 'green', 'silver']
const functionsList = [
  'chronograph',
  'alarm',
  'backlight',
  'world time',
  'date',
]

const images = [
  '/img/watches/Casio-Sport.png',
  '/img/watches/Casio-Classic.png',
  '/img/watches/Citizen-Classic.png',
  '/img/watches/Citizen-Sport.png',
  '/img/watches/Orient-Classic.png',
  '/img/watches/Seiko-Classic.png',
  '/img/watches/Tissot-Premium.png',
]

const lineImages = ['/img/cartier.png', '/img/omega.png', '/img/patek.png']

const types = ['classic', 'sport', 'premium', 'line']

module.exports = {
  async up(db) {
    return db.collection('watches').insertMany(
      [...Array(50)].map(() => {
        const type = getRandomArrayValue(types)

        const characteristics = [
          {
            type: 'classic',
            brand: getRandomArrayValue(brands),
            mechanism: getRandomArrayValue(mechanisms),
            glassType: getRandomArrayValue(glassTypes),
            caseMaterial: getRandomArrayValue(caseMaterials),
            strapMaterial: getRandomArrayValue(strapMaterials),
            caseColor: getRandomArrayValue(caseColors),
            dialColor: getRandomArrayValue(dialColors),
            functions: [
              ...new Set([
                getRandomArrayValue(functionsList),
                getRandomArrayValue(functionsList),
              ]),
            ],
            collection: getRandomArrayValue(collections),
            gender: getRandomArrayValue(genders),
          },
          {
            type: 'sport',
            brand: getRandomArrayValue(brands),
            mechanism: getRandomArrayValue(mechanisms),
            glassType: getRandomArrayValue(glassTypes),
            caseMaterial: getRandomArrayValue(caseMaterials),
            strapMaterial: getRandomArrayValue(strapMaterials),
            caseColor: getRandomArrayValue(caseColors),
            dialColor: getRandomArrayValue(dialColors),
            functions: [
              ...new Set([
                getRandomArrayValue(functionsList),
                getRandomArrayValue(functionsList),
              ]),
            ],
            collection: getRandomArrayValue(collections),
            gender: getRandomArrayValue(genders),
          },
          {
            type: 'premium',
            brand: getRandomArrayValue(brands),
            mechanism: getRandomArrayValue(mechanisms),
            glassType: getRandomArrayValue(glassTypes),
            caseMaterial: getRandomArrayValue(caseMaterials),
            strapMaterial: getRandomArrayValue(strapMaterials),
            caseColor: getRandomArrayValue(caseColors),
            dialColor: getRandomArrayValue(dialColors),
            functions: [
              ...new Set([
                getRandomArrayValue(functionsList),
                getRandomArrayValue(functionsList),
              ]),
            ],
            collection: getRandomArrayValue(collections),
            gender: getRandomArrayValue(genders),
          },
          {
            type: 'line',
            brand: getRandomArrayValue(brands),
            mechanism: getRandomArrayValue(mechanisms),
            glassType: getRandomArrayValue(glassTypes),
            caseMaterial: getRandomArrayValue(caseMaterials),
            strapMaterial: getRandomArrayValue(strapMaterials),
            caseColor: getRandomArrayValue(caseColors),
            dialColor: getRandomArrayValue(dialColors),
            functions: [
              ...new Set([
                getRandomArrayValue(functionsList),
                getRandomArrayValue(functionsList),
              ]),
            ],
            collection: getRandomArrayValue(collections),
            gender: getRandomArrayValue(genders),
          },
        ]

        const currentCharacteristics = characteristics.find(
          (item) => item.type === type
        )

        const itemImages =
          type === 'line' && currentCharacteristics.collection === 'line'
            ? [getRandomArrayValue(lineImages)]
            : images.filter((img) =>
                img.toLowerCase().includes(type.toLowerCase())
              )

        return {
          category: 'watches',
          type,
          price: +faker.string.numeric(4).replace(/.{0,2}$/, 99),
          name: faker.lorem.words(3),
          description: faker.lorem.sentences(5),
          characteristics: currentCharacteristics,
          images: itemImages.length ? itemImages : [images[0]],
          vendorCode: faker.string.numeric(6),
          inStock: +faker.string.numeric(2),
          isBestseller: faker.datatype.boolean(),
          isNew: faker.datatype.boolean(),
          popularity: +faker.string.numeric(3),
          sizes: {
            38: faker.datatype.boolean(),
            40: faker.datatype.boolean(),
            42: faker.datatype.boolean(),
            44: faker.datatype.boolean(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })
    )
  },

  async down(db) {
    return db.collection('watches').deleteMany({})
  },
}
