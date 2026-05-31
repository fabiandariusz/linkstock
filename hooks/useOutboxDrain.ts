import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { createStore } from '../store/store';
import { asyncStorageAdapter } from '../store/asyncStorageAdapter';
import { drainOutbox } from '../store/outbox';

const store = createStore(asyncStorageAdapter);

export function useOutboxDrain(onDrained: () => void) {
  const onDrainedRef = useRef(onDrained);
  onDrainedRef.current = onDrained;

  useEffect(() => {
    let cancelled = false;

    async function drain() {
      const entries = await drainOutbox();
      if (cancelled || entries.length === 0) return;
      for (const entry of entries) {
        await store.saveItem(entry.url, {
          title: entry.title,
          tags: entry.tags,
          collectionId: entry.collectionId,
        });
      }
      onDrainedRef.current();
    }

    drain();
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') drain();
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);
}
