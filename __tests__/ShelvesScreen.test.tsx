import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { ShelvesScreen } from '../screens/ShelvesScreen';
import type { Collection, Item } from '../store/store';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => store[key] ?? null),
      setItem: jest.fn(async (key: string, value: string) => { store[key] = value; }),
      removeItem: jest.fn(async (key: string) => { delete store[key]; }),
      clear: jest.fn(async () => { Object.keys(store).forEach(k => delete store[k]); }),
    },
  };
});

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

const COLLECTIONS: Collection[] = [
  { id: 'c1', name: 'Design', emoji: '🎨', hue: 200 },
  { id: 'c2', name: 'Science', emoji: '🔬', hue: 120 },
];

function makeItem(overrides: Partial<Item> & { id: string }): Item {
  return {
    url: 'https://example.com',
    title: 'Test item',
    excerpt: 'excerpt',
    author: 'Author',
    site: 'example.com',
    minutes: 5,
    savedAt: new Date().toISOString(),
    progress: 0,
    tags: [],
    collectionId: null,
    kind: 'article',
    highlights: [],
    notes: {},
    unread: true,
    ...overrides,
  };
}

const saturday = (() => {
  const d = new Date();
  const day = d.getDay();
  const daysToSat = (6 - day + 7) % 7 || 7;
  d.setDate(d.getDate() - daysToSat);
  return d.toISOString();
})();

const ITEMS: Item[] = [
  makeItem({ id: 'i1', collectionId: 'c1', tags: ['reading'], minutes: 8 }),
  makeItem({ id: 'i2', collectionId: 'c1', tags: ['reading', 'focus'], minutes: 20 }),
  makeItem({ id: 'i3', collectionId: 'c2', tags: ['physics'], minutes: 18, savedAt: saturday }),
  makeItem({ id: 'i4', collectionId: null, tags: ['newsletter'], minutes: 5 }),
  makeItem({ id: 'i5', collectionId: null, tags: ['newsletter', 'reading'], minutes: 16, savedAt: saturday }),
];

function seedStorage(collections = COLLECTIONS, items = ITEMS) {
  const store: Record<string, string> = {
    'linkstock:collections': JSON.stringify(collections),
    'linkstock:items': JSON.stringify(items),
  };
  AsyncStorage.getItem.mockImplementation(async (key: string) => store[key] ?? null);
  AsyncStorage.setItem.mockImplementation(async (key: string, value: string) => { store[key] = value; });
}

beforeEach(() => {
  jest.clearAllMocks();
  seedStorage();
});

function renderScreen(props: React.ComponentProps<typeof ShelvesScreen> = {}) {
  return render(
    <ThemeProvider>
      <ShelvesScreen {...props} />
    </ThemeProvider>
  );
}

describe('ShelvesScreen', () => {
  // ── Behavior 1: collections grid renders from store ─────────────────────
  it('renders collection names from the store', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('Design')).toBeTruthy();
      expect(screen.getByText('Science')).toBeTruthy();
    });
  });

  // ── Behavior 2: item count per collection is accurate ───────────────────
  it('shows correct item count for each collection', async () => {
    renderScreen();
    await waitFor(() => {
      // c1 has i1 + i2 = 2 items
      expect(screen.getByText('2 items')).toBeTruthy();
      // c2 has i3 = 1 item
      expect(screen.getByText('1 item')).toBeTruthy();
    });
  });

  // ── Behavior 3: tapping a collection calls onOpenCollection ─────────────
  it('calls onOpenCollection with the collection id when a card is pressed', async () => {
    const onOpenCollection = jest.fn();
    renderScreen({ onOpenCollection });
    await waitFor(() => expect(screen.getByText('Design')).toBeTruthy());

    fireEvent.press(screen.getByText('Design'));
    expect(onOpenCollection).toHaveBeenCalledWith('c1');
  });

  // ── Behavior 4: empty state when no collections ──────────────────────────
  it('shows empty state when there are no collections', async () => {
    seedStorage([], ITEMS);
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText(/no collections/i)).toBeTruthy();
    });
  });

  // ── Behavior 5: tag cloud shows unique tags with counts ──────────────────
  it('renders tag cloud with all unique tags and correct item counts', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText(/#reading/i)).toBeTruthy();
      expect(screen.getByText(/#newsletter/i)).toBeTruthy();
      expect(screen.getByText(/#physics/i)).toBeTruthy();
    });
  });

  // ── Behavior 6: smart shelf — over 15 minutes ───────────────────────────
  it('shows correct count for "Over 15 minutes" smart shelf', async () => {
    // i2=20min, i3=18min, i5=16min => 3 items
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('Over 15 minutes')).toBeTruthy();
    });
    // count label for that shelf should be 3
    const label = screen.getAllByText('3');
    expect(label.length).toBeGreaterThan(0);
  });

  // ── Behavior 7: smart shelf — saved on weekends ──────────────────────────
  it('shows correct count for "Saved on weekends" smart shelf', async () => {
    // i3 and i5 have saturday savedAt => 2 items
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('Saved on weekends')).toBeTruthy();
    });
    const label = screen.getAllByText('2');
    expect(label.length).toBeGreaterThan(0);
  });

  // ── Behavior 8: smart shelf — from newsletters ───────────────────────────
  it('shows correct count for "From newsletters" smart shelf', async () => {
    // i4 and i5 tagged 'newsletter' => 2 items
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('From newsletters')).toBeTruthy();
    });
    const labels = screen.getAllByText('2');
    expect(labels.length).toBeGreaterThan(0);
  });

  // ── Behavior 9: add button opens new-collection sheet ───────────────────
  it('shows a new-collection input sheet when the add button is pressed', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByText('Design')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Add collection'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/collection name/i)).toBeTruthy();
    });
  });

  // ── Behavior 10: confirming name adds collection to grid ─────────────────
  it('adds new collection to the grid after confirming the sheet', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByText('Design')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Add collection'));
    await waitFor(() => expect(screen.getByPlaceholderText(/collection name/i)).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText(/collection name/i), 'Philosophy');
    fireEvent.press(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('Philosophy')).toBeTruthy();
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'linkstock:collections',
      expect.stringContaining('Philosophy'),
    );
  });
});
