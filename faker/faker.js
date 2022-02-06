const faker = require('faker');

const categories = [
    'perferendis', 'expedita',    'laudantium',  'quisquam',   'dolores',
    'odio',        'ea',          'est',         'pariatur',   'dolores',
    'repudiandae', 'maxime',      'consequatur', 'pariatur',   'vero',
    'sit',         'ipsa',        'mollitia',    'cum',        'pariatur',
    'sint',        'praesentium', 'odit',        'dolores',    'voluptate',
    'vero',        'accusamus',   'qui',         'qui',        'dolorem',
    'magnam',      'a',           'doloribus',   'rem',        'animi',
    'temporibus',  'sit',         'at',          'autem',      'sed',
    'explicabo',   'error',       'non',         'et',         'error',
    'saepe',       'cum',         'eos',         'inventore',  'voluptatum',
    'maxime',      'dolores',     'a',           'veritatis',  'autem',
    'doloremque',  'placeat',     'ad',          'minus',      'omnis',
    'totam',       'alias',       'vero',        'id',         'vel',
    'dolorem',     'aut',         'minus',       'et',         'aut',
    'dolorem',     'consequatur', 'incidunt',    'sed',        'facere',
    'ipsum',       'aut',         'tempore',     'ut',         'ad',
    'quod',        'quasi',       'amet',        'repellat',   'quidem',
    'rerum',       'unde',        'odit',        'odit',       'veniam',
    'odit',        'tenetur',     'qui',         'recusandae', 'est',
    'qui',         'neque',       'eum',         'quia',       'quia'
  ]

const createCategory = (num) => {
    const categories = [];

    for (let i = 0; i < num; i++) {
        categories.push({
            name: faker.lorem.word(),
        })
    }

    return categories;
}

const getRandomCategories = (num) => {
    return [...new Set(createCategory(num).map(each => each.name))];
}

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

const generateEvents = (num) => {
    const events = [];

    for (let i = 0; i < num; i++) {
        const data = {
            name: faker.commerce.productName(),
            street: faker.address.streetAddress(),
            state: faker.address.state(),
            country: faker.address.country(),
            start_time: faker.date.past(),
            end_time: faker.date.future(),
            email: faker.internet.email(),
            about: faker.lorem.sentences(),
            city: faker.address.city(),
            postalCode: faker.address.zipCode()
        }

        const optionals = {}

        if (setValue(0.8)) optionals.website = faker.internet.domainName()
        if (setValue(0.8)) optionals.phone = faker.phone.phoneNumber()
        if (setValue(0.6)) optionals.description = faker.lorem.paragraph()

        if (setValue(0.7)) {
            optionals.latitude = Number(faker.address.latitude());
            optionals.longitude = Number(faker.address.longitude());
        }

        // WITHOUT THE CATEGORIES
        events.push({
            ...data,
            ...optionals,
            categories: getRandomCategories(Number.parseInt(Math.random() * 15))
        })
    }

    return events;
}

const setValue = (chance) => Math.random() < chance;

// console.log(createCategory(100).map(each => each.name))

console.log(JSON.stringify(generateEvents(2)))