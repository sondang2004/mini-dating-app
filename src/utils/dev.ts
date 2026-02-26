import { faker } from '@faker-js/faker';
import { StorageService } from '../services/storage';
import type { Profile, Gender } from '../types/models';

export async function seedDatabase() {
  if (!import.meta.env.DEV) return;

  const genders: Gender[] = ['male', 'female', 'non-binary', 'other'];
  const fakePromises = [];

  // Create 10 mock profiles
  for (let i = 0; i < 10; i++) {
    const id = faker.string.uuid();
    const profile: Profile = {
      id: id,
      username: faker.internet.username().toLowerCase(),
      name: faker.person.fullName(),
      age: faker.number.int({ min: 18, max: 60 }),
      gender: faker.helpers.arrayElement(genders),
      bio: faker.person.bio(),
      job: faker.person.jobTitle(),
      education: faker.company.name() + ' University',
      interests: faker.word.words(3).split(' ').join(', '),
      height: faker.helpers.arrayElement([
        '5\'8"',
        '5\'10"',
        '6\'0"',
        '5\'5"',
        '6\'2"',
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
    };
    fakePromises.push(StorageService.saveProfile(profile));
  }

  await Promise.all(fakePromises);
}

export function resetApp() {
  if (!import.meta.env.DEV) return;
  localStorage.clear();
  window.location.reload();
}
