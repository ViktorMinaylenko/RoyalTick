// eslint-disable-next-line @typescript-eslint/no-var-requires
const { faker } = require('@faker-js/faker')

const getRandomArrayValue = (arr) => arr[Math.floor(Math.random() * arr.length)]

const colors = [
  'Black',
  'Grey',
  'Navy',
  'White',
  'Brown',
  'Bordeaux',
  'Beige',
  'Green',
]
const kitTypes = ['basic', 'professional']

const images = [
  '/img/care/care_basic_1.png',
  '/img/care/care_basic_2.png',
  '/img/care/care_professional_1.png',
  '/img/care/care_professional_2.png',
]

const components = [
  'microfiber cloth',
  'cleaning spray',
  'soft horsehair brush',
  'polishing paste',
]
const materials = [
  'organic cotton',
  'synthetic microfiber',
  'natural wood',
  'genuine leather',
]
const carePeculiarities = [
  'anti-static effect',
  'alcohol-free formula',
  'scratch protection',
  'water repellent',
]
const surfaces = [
  'sapphire crystal',
  'stainless steel',
  'genuine leather',
  'ceramic bezel',
]
const scents = ['unscented', 'neutral', 'fresh linen', 'citrus', 'sandalwood']
const packaging = [
  'cardboard box',
  'magnetic hard case',
  'zipper pouch',
  'wooden casket',
]

module.exports = {
  async up(db) {
    return db.collection('care').insertMany(
      [...Array(50)].map(() => {
        const type = getRandomArrayValue(kitTypes)

        // Формуємо набори характеристик під кожен тип
        const characteristics = [
          {
            type: 'basic',
            color: getRandomArrayValue(colors),
            material: getRandomArrayValue(materials),
            scent: getRandomArrayValue(scents),
            peculiarity: getRandomArrayValue(carePeculiarities),
          },
          {
            type: 'professional',
            color: getRandomArrayValue(colors),
            component: getRandomArrayValue(components),
            surface: getRandomArrayValue(surfaces),
            packaging: getRandomArrayValue(packaging),
            peculiarity: getRandomArrayValue(carePeculiarities),
          },
        ]

        return {
          category: 'care',
          type,
          price: +faker.string.numeric(4).replace(/.{0,2}$/, '99'),
          name: faker.commerce.productName() + ' Care Set',
          description: faker.lorem.sentences(5),
          characteristics: characteristics.find((item) => item.type === type),
          images: images.filter((item) => item.includes(type)),
          vendorCode: faker.string.numeric(4),
          inStock: faker.string.numeric(2),
          isBestseller: faker.datatype.boolean(),
          isNew: faker.datatype.boolean(),
          popularity: +faker.string.numeric(3),
          sizes: {},
        }
      })
    )
  },

  async down(db) {
    return db.collection('care').deleteMany({})
  },
}
