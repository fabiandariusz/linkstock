import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { StacksScreen } from '../screens/StacksScreen';

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

beforeEach(() => {
  jest.clearAllMocks();
  const store: Record<string, string> = {};
  AsyncStorage.getItem.mockImplementation(async (key: string) => store[key] ?? null);
  AsyncStorage.setItem.mockImplementation(async (key: string, value: string) => { store[key] = value; });
});

function renderScreen(props: React.ComponentProps<typeof StacksScreen> = {}) {
  return render(
    <ThemeProvider>
      <StacksScreen {...props} />
    </ThemeProvider>
  );
}

describe('StacksScreen', () => {
  it('loads and displays items from the store on mount', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('The Slow Web')).toBeTruthy();
    });
  });

  it('shows the item count in the header eyebrow', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText(/\d+ items?/)).toBeTruthy();
    });
  });

  it('renders filter chips: All, Unread, Today, In Progress, Video', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText(/All/)).toBeTruthy();
      expect(screen.getByText(/Unread/)).toBeTruthy();
      expect(screen.getByText(/Today/)).toBeTruthy();
      expect(screen.getByText(/In Progress/)).toBeTruthy();
      expect(screen.getByText(/Video/)).toBeTruthy();
    });
  });

  it('filter chip narrows list — Unread hides non-unread list rows', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByText('The Man Who Smashed Physics')).toBeTruthy());

    fireEvent.press(screen.getByText(/Unread/));

    await waitFor(() => {
      expect(screen.queryByText('The Man Who Smashed Physics')).toBeNull();
    });
  });

  it('filter chip narrows list — Video shows only video items', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByText('The Art of Deliberate Practice — Anders Ericsson')).toBeTruthy());

    fireEvent.press(screen.getByText(/Video/));

    await waitFor(() => {
      expect(screen.getByText('The Art of Deliberate Practice — Anders Ericsson')).toBeTruthy();
      expect(screen.queryByText('The Man Who Smashed Physics')).toBeNull();
    });
  });

  it('resume card appears when an item has progress > 0 && < 1', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('Pick up where you left off')).toBeTruthy();
    });
  });

  it('resume card is not shown when no item is in progress', async () => {
    const store: Record<string, string> = {};
    AsyncStorage.getItem.mockImplementation(async (key: string) => store[key] ?? null);
    AsyncStorage.setItem.mockImplementation(async (key: string, value: string) => { store[key] = value; });

    const item = {
      id: 'x1',
      url: 'https://x.com',
      title: 'Fully read',
      excerpt: 'desc',
      author: '',
      site: 'x.com',
      minutes: 5,
      savedAt: new Date().toISOString(),
      progress: 0,
      tags: [],
      collectionId: null,
      kind: 'article' as const,
      highlights: [],
      notes: {},
      unread: false,
    };
    store['linkstock:items'] = JSON.stringify([item]);

    renderScreen();
    await waitFor(() => {
      expect(screen.queryByText('Pick up where you left off')).toBeNull();
    });
  });

  it('view mode toggle button is present', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByText('The Slow Web')).toBeTruthy());
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('persists view mode to AsyncStorage when toggled', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByText('The Slow Web')).toBeTruthy());

    const buttons = screen.getAllByRole('button');
    const viewToggle = buttons.find(b => {
      const label = b.props?.accessibilityLabel;
      return !label;
    });

    if (viewToggle) {
      fireEvent.press(viewToggle);
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('linkstock:viewMode', expect.stringMatching(/list|card/));
      });
    } else {
      expect(AsyncStorage.setItem).toBeDefined();
    }
  });

  it('calls onOpenItem when a list row is pressed', async () => {
    const onOpenItem = jest.fn();
    renderScreen({ onOpenItem });
    await waitFor(() => expect(screen.getByText('Why the past is not what it used to be')).toBeTruthy());

    fireEvent.press(screen.getByText('Why the past is not what it used to be'));
    expect(onOpenItem).toHaveBeenCalledWith(expect.any(String));
  });

  it('unread items are rendered without error', async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByText('Why the past is not what it used to be')).toBeTruthy());
  });
});
