import { createStore, StorageAdapter } from '../store/store';

function makeAdapter(): StorageAdapter {
  const data = new Map<string, string>();
  return {
    getItem: async (key: string) => data.get(key) ?? null,
    setItem: async (key: string, value: string) => { data.set(key, value); },
  };
}

describe('store', () => {
  describe('items', () => {
    it('saveItem persists and getItems returns the saved item', async () => {
      const store = createStore(makeAdapter());
      await store.saveItem('https://example.com', { title: 'Example' });
      const items = await store.getItems();
      expect(items).toHaveLength(1);
      expect(items[0].url).toBe('https://example.com');
      expect(items[0].title).toBe('Example');
    });

    it('getItems returns items newest-first', async () => {
      const store = createStore(makeAdapter());
      await store.saveItem('https://first.com', { title: 'First' });
      await store.saveItem('https://second.com', { title: 'Second' });
      const items = await store.getItems();
      expect(items[0].title).toBe('Second');
      expect(items[1].title).toBe('First');
    });

    it('updateItem patches a field without replacing the whole item', async () => {
      const store = createStore(makeAdapter());
      const saved = await store.saveItem('https://example.com', { title: 'Old' });
      await store.updateItem(saved.id, { title: 'New', progress: 0.5 });
      const items = await store.getItems();
      expect(items[0].title).toBe('New');
      expect(items[0].progress).toBe(0.5);
      expect(items[0].url).toBe('https://example.com');
    });

    it('deleteItem removes the item from the list', async () => {
      const store = createStore(makeAdapter());
      const a = await store.saveItem('https://a.com', { title: 'A' });
      await store.saveItem('https://b.com', { title: 'B' });
      await store.deleteItem(a.id);
      const items = await store.getItems();
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('B');
    });

    it('new items are unread by default', async () => {
      const store = createStore(makeAdapter());
      const item = await store.saveItem('https://example.com');
      expect(item.unread).toBe(true);
    });

    it('site is inferred from URL when not provided', async () => {
      const store = createStore(makeAdapter());
      const item = await store.saveItem('https://news.ycombinator.com/item?id=1');
      expect(item.site).toBe('news.ycombinator.com');
    });
  });

  describe('collections', () => {
    it('saveCollection persists and getCollections returns it', async () => {
      const store = createStore(makeAdapter());
      await store.saveCollection('Design', '🎨');
      const cols = await store.getCollections();
      expect(cols).toHaveLength(1);
      expect(cols[0].name).toBe('Design');
      expect(cols[0].emoji).toBe('🎨');
    });

    it('saveCollection uses a default emoji when none provided', async () => {
      const store = createStore(makeAdapter());
      await store.saveCollection('Tech');
      const cols = await store.getCollections();
      expect(cols[0].emoji).toBeTruthy();
    });

    it('multiple collections accumulate', async () => {
      const store = createStore(makeAdapter());
      await store.saveCollection('A');
      await store.saveCollection('B');
      const cols = await store.getCollections();
      expect(cols).toHaveLength(2);
    });
  });
});
