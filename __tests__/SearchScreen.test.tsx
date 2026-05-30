import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { SearchScreen } from '../screens/SearchScreen';
import type { Item } from '../store/store';

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

function makeItem(overrides: Partial<Item> & { id: string }): Item {
  return {
    url: 'https://example.com',
    title: 'Default Title',
    excerpt: 'Default excerpt.',
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
    unread: false,
    ...overrides,
  };
}

const ITEMS: Item[] = [
  makeItem({ id: 'i1', title: 'The Slow Web', site: 'essays.co', tags: ['reading', 'focus'], minutes: 8, unread: false, kind: 'article' }),
  makeItem({ id: 'i2', title: 'Why Memory Fails', excerpt: 'A study on cognition.', site: 'aeon.co', tags: ['psychology'], minutes: 12, unread: true, kind: 'article' }),
  makeItem({ id: 'i3', title: 'Design Systems at Scale', site: 'substack.com', tags: ['design'], minutes: 20, unread: true, kind: 'article' }),
  makeItem({ id: 'i4', title: 'Deliberate Practice', site: 'youtube.com', tags: ['learning'], minutes: 32, unread: true, kind: 'video', highlights: [1, 2] }),
  makeItem({ id: 'i5', title: 'Writing Briefly', author: 'Paul Graham', site: 'paulgraham.com', tags: ['writing'], minutes: 5, unread: false, kind: 'article' }),
];

function seedItems(items = ITEMS) {
  const store: Record<string, string> = {
    'linkstock:items': JSON.stringify(items),
  };
  AsyncStorage.getItem.mockImplementation(async (key: string) => store[key] ?? null);
  AsyncStorage.setItem.mockImplementation(async (key: string, value: string) => { store[key] = value; });
}

beforeEach(() => {
  jest.clearAllMocks();
  seedItems();
});

function renderScreen(props: React.ComponentProps<typeof SearchScreen> = {}) {
  return render(
    <ThemeProvider>
      <SearchScreen {...props} />
    </ThemeProvider>
  );
}

describe('SearchScreen', () => {
  // ── Behavior 1: real-time full-text filtering ────────────────────────────
  it('filters results in real time as user types', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByPlaceholderText(/search/i)).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText(/search/i), 'slow');

    await waitFor(() => {
      expect(screen.getByText('The Slow Web')).toBeTruthy();
      expect(screen.queryByText('Why Memory Fails')).toBeNull();
    });
  });

  // ── Behavior 2: tag: operator ────────────────────────────────────────────
  it('tag: operator returns only items with that tag', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByPlaceholderText(/search/i)).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText(/search/i), 'tag:design');

    await waitFor(() => {
      expect(screen.getByText('Design Systems at Scale')).toBeTruthy();
      expect(screen.queryByText('The Slow Web')).toBeNull();
      expect(screen.queryByText('Why Memory Fails')).toBeNull();
    });
  });

  // ── Behavior 3: min: operator ────────────────────────────────────────────
  it('min:N operator returns only items with minutes >= N', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByPlaceholderText(/search/i)).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText(/search/i), 'min:20');

    await waitFor(() => {
      expect(screen.getByText('Design Systems at Scale')).toBeTruthy();
      expect(screen.getByText('Deliberate Practice')).toBeTruthy();
      expect(screen.queryByText('The Slow Web')).toBeNull();
      expect(screen.queryByText('Why Memory Fails')).toBeNull();
    });
  });

  // ── Behavior 4: site: operator ───────────────────────────────────────────
  it('site: operator returns only items from that domain', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByPlaceholderText(/search/i)).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText(/search/i), 'site:substack.com');

    await waitFor(() => {
      expect(screen.getByText('Design Systems at Scale')).toBeTruthy();
      expect(screen.queryByText('The Slow Web')).toBeNull();
    });
  });

  // ── Behavior 5: unread operator ──────────────────────────────────────────
  it('unread operator returns only unread items', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByPlaceholderText(/search/i)).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText(/search/i), 'unread');

    await waitFor(() => {
      expect(screen.getByText('Why Memory Fails')).toBeTruthy();
      expect(screen.getByText('Design Systems at Scale')).toBeTruthy();
      expect(screen.queryByText('The Slow Web')).toBeNull();
      expect(screen.queryByText('Writing Briefly')).toBeNull();
    });
  });

  // ── Behavior 6: video operator ───────────────────────────────────────────
  it('video operator returns only video items', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByPlaceholderText(/search/i)).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText(/search/i), 'video');

    await waitFor(() => {
      expect(screen.getByText('Deliberate Practice')).toBeTruthy();
      expect(screen.queryByText('The Slow Web')).toBeNull();
      expect(screen.queryByText('Design Systems at Scale')).toBeNull();
    });
  });

  // ── Behavior 7: empty state ──────────────────────────────────────────────
  it('shows empty state when no results match', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByPlaceholderText(/search/i)).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText(/search/i), 'zzznomatch');

    await waitFor(() => {
      expect(screen.getByText(/nothing on that shelf/i)).toBeTruthy();
    });
  });

  // ── Behavior 8: recent searches saved and shown on next visit ────────────
  it('saves a search and shows it as a recent search', async () => {
    const { unmount } = renderScreen();
    await waitFor(() => expect(screen.getByPlaceholderText(/search/i)).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText(/search/i), 'cognition');
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'linkstock:recentSearches',
      expect.stringContaining('cognition'),
    ));

    unmount();

    // re-mount simulates new visit
    const store: Record<string, string> = { 'linkstock:items': JSON.stringify(ITEMS) };
    AsyncStorage.getItem.mockImplementation(async (key: string) => store[key] ?? null);
    AsyncStorage.setItem.mockImplementation(async (key: string, value: string) => { store[key] = value; });
    // seed the saved recents
    const saved = JSON.parse(
      (await AsyncStorage.setItem.mock.calls
        .filter((c: [string, string]) => c[0] === 'linkstock:recentSearches')
        .slice(-1)[0]?.[1]) ?? '[]'
    );
    store['linkstock:recentSearches'] = JSON.stringify(saved);

    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('cognition')).toBeTruthy();
    });
  });

  // ── Behavior 9: tapping recent search populates field ────────────────────
  it('tapping a recent search populates the field and filters results', async () => {
    const store: Record<string, string> = {
      'linkstock:items': JSON.stringify(ITEMS),
      'linkstock:recentSearches': JSON.stringify(['slow']),
    };
    AsyncStorage.getItem.mockImplementation(async (key: string) => store[key] ?? null);
    AsyncStorage.setItem.mockImplementation(async (key: string, value: string) => { store[key] = value; });

    renderScreen();
    await waitFor(() => expect(screen.getByText('slow')).toBeTruthy());

    fireEvent.press(screen.getByText('slow'));

    await waitFor(() => {
      expect(screen.getByText('The Slow Web')).toBeTruthy();
    });
  });

  // ── Behavior 10: clear button resets the field ───────────────────────────
  it('clear button resets the field and shows pre-search state', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByPlaceholderText(/search/i)).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText(/search/i), 'slow');
    await waitFor(() => expect(screen.getByText('The Slow Web')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Clear search'));

    await waitFor(() => {
      expect(screen.queryByText('The Slow Web')).toBeNull();
      expect(screen.getByText(/try searching/i)).toBeTruthy();
    });
  });

  // ── Behavior 11: tapping a result calls onOpenItem ───────────────────────
  it('tapping a result calls onOpenItem with the item id', async () => {
    const onOpenItem = jest.fn();
    renderScreen({ onOpenItem });
    await waitFor(() => expect(screen.getByPlaceholderText(/search/i)).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText(/search/i), 'slow');
    await waitFor(() => expect(screen.getByText('The Slow Web')).toBeTruthy());

    fireEvent.press(screen.getByText('The Slow Web'));
    expect(onOpenItem).toHaveBeenCalledWith('i1');
  });
});
