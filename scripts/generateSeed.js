import { faker } from '@faker-js/faker';
import fs from 'fs';

const genders = ['male', 'female', 'non-binary', 'other'];

const profiles = [];

for (let i = 0; i < 50; i++) {
    const gender = faker.helpers.arrayElement(genders);
    const isFemale = gender === 'female';
    const personSex = isFemale ? 'female' : 'male';

    // To keep avatars predictable and fast, we can use distinct ui-avatars or unsplash source.
    // Using regular user portraits. Add a random seed for Unsplash so they don't cache identical images.
    const avatarId = faker.number.int({ min: 1, max: 80 });
    const avatarUrl = isFemale
        ? `https://randomuser.me/api/portraits/women/${avatarId}.jpg`
        : `https://randomuser.me/api/portraits/men/${avatarId}.jpg`;

    const profile = {
        id: faker.string.uuid(),
        username: faker.internet.username({ sex: personSex }).toLowerCase().replace(/[^a-z0-9]/g, ''),
        name: faker.person.fullName({ sex: personSex }),
        age: faker.number.int({ min: 18, max: 45 }),
        gender,
        bio: faker.person.bio(),
        job: faker.person.jobTitle(),
        education: faker.company.name() + ' University',
        interests: faker.word.words(3).split(' ').join(', '),
        height: faker.helpers.arrayElement([
            '5\'2"', '5\'5"', '5\'8"', '5\'10"', '6\'0"', '6\'2"',
        ]),
        lookingFor: faker.helpers.arrayElement([
            'Long-term partnership',
            'Short-term fun',
            'New friends',
            'Still figuring it out',
        ]),
        pets: faker.helpers.arrayElement([
            'Dog lover',
            'Cat lover',
            'Both',
            'No pets',
        ]),
        drinking: faker.helpers.arrayElement(['Socially', 'Never', 'Frequently']),
        smoking: faker.helpers.arrayElement(['Never', 'Socially', 'Regularly']),
        prompt1: {
            question: 'A random fact I love is...',
            answer: faker.hacker.phrase(),
        },
        prompt2: {
            question: 'My typical Sunday looks like...',
            answer:
                'Sleeping in until noon and then ' + faker.company.catchPhrase(),
        },
        avatarUrl,
        createdAt: faker.date.past().getTime()
    };
    profiles.push(profile);
}

fs.writeFileSync('./src/data/seedProfiles.json', JSON.stringify(profiles, null, 2));
console.log('Successfully generated 50 profiles into src/data/seedProfiles.json');
