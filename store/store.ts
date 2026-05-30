export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export interface Item {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  author: string;
  site: string;
  minutes: number;
  savedAt: string;
  progress: number;
  tags: string[];
  collectionId: string | null;
  kind: 'article' | 'video';
  highlights: number[];
  notes: Record<number, string>;
  unread: boolean;
}

export interface Collection {
  id: string;
  name: string;
  emoji: string;
  hue: number;
}

const ITEMS_KEY = 'linkstock:items';
const COLLECTIONS_KEY = 'linkstock:collections';

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createStore(adapter: StorageAdapter) {
  async function getItems(): Promise<Item[]> {
    const raw = await adapter.getItem(ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  async function saveItem(url: string, meta: Partial<Omit<Item, 'id' | 'url' | 'savedAt'>> = {}): Promise<Item> {
    const items = await getItems();
    const item: Item = {
      id: uuid(),
      url,
      title: meta.title ?? '',
      excerpt: meta.excerpt ?? '',
      author: meta.author ?? '',
      site: meta.site ?? new URL(url).hostname,
      minutes: meta.minutes ?? 0,
      savedAt: new Date().toISOString(),
      progress: 0,
      tags: meta.tags ?? [],
      collectionId: meta.collectionId ?? null,
      kind: meta.kind ?? 'article',
      highlights: [],
      notes: {},
      unread: true,
    };
    await adapter.setItem(ITEMS_KEY, JSON.stringify([item, ...items]));
    return item;
  }

  async function updateItem(id: string, patch: Partial<Item>): Promise<void> {
    const items = await getItems();
    const updated = items.map(i => i.id === id ? { ...i, ...patch, id } : i);
    await adapter.setItem(ITEMS_KEY, JSON.stringify(updated));
  }

  async function deleteItem(id: string): Promise<void> {
    const items = await getItems();
    await adapter.setItem(ITEMS_KEY, JSON.stringify(items.filter(i => i.id !== id)));
  }

  async function getCollections(): Promise<Collection[]> {
    const raw = await adapter.getItem(COLLECTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  async function saveCollection(name: string, emoji = '📁'): Promise<Collection> {
    const collections = await getCollections();
    const collection: Collection = {
      id: uuid(),
      name,
      emoji,
      hue: Math.floor(Math.random() * 360),
    };
    await adapter.setItem(COLLECTIONS_KEY, JSON.stringify([...collections, collection]));
    return collection;
  }

  return { getItems, saveItem, updateItem, deleteItem, getCollections, saveCollection };
}
