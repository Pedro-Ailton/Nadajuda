import type { UserProfile, Competition, Workout } from './types';

export const mockUserProfile: UserProfile = {
  name: 'Alex Aqua',
  dob: new Date('1998-07-15'),
  email: 'alex.aqua@example.com',
  notes: 'Focusing on improving butterfly stroke and endurance for the upcoming season. Needs to work on underwater kicks and turns.',
  avatarUrl: 'https://picsum.photos/seed/10/200/200',
};

export const mockCompetitions: Competition[] = [
  { id: '1', event: '50m Freestyle', time: '23.54s', date: '2024-06-15' },
  { id: '2', event: '100m Butterfly', time: '55.12s', date: '2024-06-15' },
  { id: '3', event: '200m Freestyle', time: '1:58.90', date: '2024-05-20' },
  { id: '4', event: '50m Freestyle', time: '23.88s', date: '2024-05-20' },
  { id: '5', event: '100m Backstroke', time: '59.80s', date: '2024-04-10' },
  { id: '6', event: '50m Freestyle', time: '24.10s', date: '2024-04-10' },
  { id: '7', event: '100m Butterfly', time: '56.05s', date: '2024-03-05' },
  { id: '8', event: '200m IM', time: '2:10.50', date: '2024-03-05' },
];

export const mockWorkouts: Workout[] = [
  {
    id: 'w1',
    description: 'Main Set: 10x100m Freestyle on 1:30',
    estimatedTime: '15:00',
    actualTime: '14:45',
  },
  {
    id: 'w2',
    description: 'Kick Set: 8x50m Butterfly Kick w/ board on 1:00',
    estimatedTime: '8:00',
    actualTime: '8:10',
  },
  {
    id: 'w3',
    description: 'Pull Set: 4x200m Freestyle w/ paddles on 3:00',
    estimatedTime: '12:00',
    actualTime: '11:50',
  },
  {
    id: 'w4',
    description: 'Sprint Set: 12x25m MAX from dive on 1:00',
    estimatedTime: '12:00',
    actualTime: '11:30',
  },
];
