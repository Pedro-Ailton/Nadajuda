'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { setDoc, doc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { useEffect } from 'react';

const eventsToAdd = [
  { id: '50-livre', name: '50m livre', distance: 50, stroke: 'livre' },
  { id: '100-livre', name: '100m livre', distance: 100, stroke: 'livre' },
  { id: '200-livre', name: '200m livre', distance: 200, stroke: 'livre' },
  { id: '400-livre', name: '400m livre', distance: 400, stroke: 'livre' },
  { id: '800-livre', name: '800m livre', distance: 800, stroke: 'livre' },
  { id: '1500-livre', name: '1500m livre', distance: 1500, stroke: 'livre' },
  { id: '50-costas', name: '50m costas', distance: 50, stroke: 'costas' },
  { id: '100-costas', name: '100m costas', distance: 100, stroke: 'costas' },
  { id: '200-costas', name: '200m costas', distance: 200, stroke: 'costas' },
  { id: '50-borboleta', name: '50m borboleta', distance: 50, stroke: 'borboleta' },
  { id: '100-borboleta', name: '100m borboleta', distance: 100, stroke: 'borboleta' },
  { id: '200-borboleta', name: '200m borboleta', distance: 200, stroke: 'borboleta' },
  { id: '50-peito', name: '50m peito', distance: 50, stroke: 'peito' },
  { id: '100-peito', name: '100m peito', distance: 100, stroke: 'peito' },
  { id: '200-peito', name: '200m peito', distance: 200, stroke: 'peito' },
  { id: '200-medley', name: '200m medley', distance: 200, stroke: 'medley' },
  { id: '400-medley', name: '400m medley', distance: 400, stroke: 'medley' },
];

export function AddEventData() {
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;

    const addEvents = async () => {
      const eventsCollection = collection(firestore, 'events');
      const snapshot = await getDocs(eventsCollection);

      if (snapshot.empty) {
        const batch = writeBatch(firestore);
        eventsToAdd.forEach(eventData => {
          const docRef = doc(firestore, 'events', eventData.id);
          batch.set(docRef, eventData);
        });
        await batch.commit();
      }
    };

    addEvents();
  }, [firestore]);

  return null;
}
