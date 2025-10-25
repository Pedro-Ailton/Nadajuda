import type { Competition, Workout } from './types';

export const mockCompetitions: Competition[] = [
  { id: '1', event: '50m Livre', time: '23.54s', date: '2024-06-15' },
  { id: '2', event: '100m Borboleta', time: '55.12s', date: '2024-06-15' },
  { id: '3', event: '200m Livre', time: '1:58.90', date: '2024-05-20' },
  { id: '4', event: '50m Livre', time: '23.88s', date: '2024-05-20' },
  { id: '5', event: '100m Costas', time: '59.80s', date: '2024-04-10' },
  { id: '6', event: '50m Livre', time: '24.10s', date: '2024-04-10' },
  { id: '7', event: '100m Borboleta', time: '56.05s', date: '2024-03-05' },
  { id: '8', event: '200m Medley', time: '2:10.50', date: '2024-03-05' },
];

export const mockWorkouts: Workout[] = [
  {
    id: 'w1',
    description: 'Série Principal: 10x100m Livre em 1:30',
    estimatedTime: '15:00',
    actualTime: '14:45',
  },
  {
    id: 'w2',
    description: 'Série de Perna: 8x50m Perna Borboleta com prancha em 1:00',
    estimatedTime: '8:00',
    actualTime: '8:10',
  },
  {
    id: 'w3',
    description: 'Série de Braço: 4x200m Livre com palmar em 3:00',
    estimatedTime: '12:00',
    actualTime: '11:50',
  },
  {
    id: 'w4',
    description: 'Série de Velocidade: 12x25m MÁX saindo do bloco em 1:00',
    estimatedTime: '12:00',
    actualTime: '11:30',
  },
];
