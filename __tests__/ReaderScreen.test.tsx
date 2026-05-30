import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { ReaderScreen } from '../screens/ReaderScreen';

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

const ITEM_ID = 'test-item-1';

const MOCK_ITEMS = JSON.stringify([{
  id: ITEM_ID,
  url: 'https://essays.co/test',
  title: 'Test Article',
  excerpt: 'An excerpt about something interesting.',
  author: 'Jane Doe',
  site: 'essays.co',
  minutes: 8,
  savedAt: new Date().toISOString(),
  progress: 0.3,
  tags: ['reading'],
  collectionId: null,
  kind: 'article',
  highlights: [1],
  notes: {},
  unread: false,
}]);

beforeEach(() => {
  jest.clearAllMocks();
  const kvStore: Record<string, string> = { 'linkstock:items': MOCK_ITEMS };
  AsyncStorage.getItem.mockImplementation(async (key: string) => kvStore[key] ?? null);
  AsyncStorage.setItem.mockImplementation(async (key: string, value: string) => { kvStore[key] = value; });
});

function renderScreen(props: Partial<React.ComponentProps<typeof ReaderScreen>> = {}) {
  return render(
    <ThemeProvider>
      <ReaderScreen itemId={ITEM_ID} onBack={() => {}} {...props} />
    </ThemeProvider>
  );
}

describe('ReaderScreen', () => {
  it('renders loading state before item loads', () => {
    renderScreen();
    expect(screen.getByText('Loading…')).toBeTruthy();
  });

  it('renders article title after item loads', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeTruthy();
    });
  });

  it('renders author name', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeTruthy();
    });
  });

  it('calls onBack when back button is pressed', async () => {
    const onBack = jest.fn();
    renderScreen({ onBack });
    await waitFor(() => screen.getByText('Test Article'));
    fireEvent.press(screen.getByTestId('btn-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows progress percentage from item', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText(/30%/)).toBeTruthy();
    });
  });

  it('shows min left based on progress', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText(/min left/)).toBeTruthy();
    });
  });

  it('shows site name in top bar', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('ESSAYS.CO')).toBeTruthy();
    });
  });

  it('toggles TTS bar when speaker button is pressed', async () => {
    renderScreen();
    await waitFor(() => screen.getByText('Test Article'));
    fireEvent.press(screen.getByTestId('btn-speaker'));
    expect(screen.getByText('LISTENING')).toBeTruthy();
  });

  it('hides TTS bar when Stop is pressed', async () => {
    renderScreen();
    await waitFor(() => screen.getByText('Test Article'));
    fireEvent.press(screen.getByTestId('btn-speaker'));
    expect(screen.getByText('STOP')).toBeTruthy();
    fireEvent.press(screen.getByTestId('btn-stop'));
    expect(screen.queryByText('LISTENING')).toBeNull();
  });

  it('toggles font controls panel when Aa button is pressed', async () => {
    renderScreen();
    await waitFor(() => screen.getByText('Test Article'));
    fireEvent.press(screen.getByTestId('btn-aa'));
    expect(screen.getByText('THEME')).toBeTruthy();
    expect(screen.getByText('SIZE')).toBeTruthy();
    expect(screen.getByText('FONT')).toBeTruthy();
  });

  it('shows Paper, Sepia, Night theme chips in controls panel', async () => {
    renderScreen();
    await waitFor(() => screen.getByText('Test Article'));
    fireEvent.press(screen.getByTestId('btn-aa'));
    expect(screen.getByText('Paper')).toBeTruthy();
    expect(screen.getByText('Sepia')).toBeTruthy();
    expect(screen.getByText('Night')).toBeTruthy();
  });

  it('persists theme selection to AsyncStorage', async () => {
    renderScreen();
    await waitFor(() => screen.getByText('Test Article'));
    fireEvent.press(screen.getByTestId('btn-aa'));
    fireEvent.press(screen.getByText('Sepia'));
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('linkstock:readerTheme', 'sepia');
    });
  });

  it('renders all font options in controls panel', async () => {
    renderScreen();
    await waitFor(() => screen.getByText('Test Article'));
    fireEvent.press(screen.getByTestId('btn-aa'));
    expect(screen.getByText('News')).toBeTruthy();
    expect(screen.getByText('Lora')).toBeTruthy();
    expect(screen.getByText('Crimson')).toBeTruthy();
    expect(screen.getByText('Garamond')).toBeTruthy();
  });

  it('loads saved theme from AsyncStorage on mount', async () => {
    const kvStore: Record<string, string> = {
      'linkstock:items': MOCK_ITEMS,
      'linkstock:readerTheme': 'night',
    };
    AsyncStorage.getItem.mockImplementation(async (key: string) => kvStore[key] ?? null);
    renderScreen();
    await waitFor(() => screen.getByText('Test Article'));
    fireEvent.press(screen.getByTestId('btn-aa'));
    expect(screen.getByText('Night')).toBeTruthy();
  });

  it('loads saved font size from AsyncStorage on mount', async () => {
    const kvStore: Record<string, string> = {
      'linkstock:items': MOCK_ITEMS,
      'linkstock:fontSize': '22',
    };
    AsyncStorage.getItem.mockImplementation(async (key: string) => kvStore[key] ?? null);
    renderScreen();
    await waitFor(() => screen.getByText('Test Article'));
  });

  it('highlights paragraphs from stored highlights', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeTruthy();
    });
    expect(screen.getByText(/There is a particular quality/)).toBeTruthy();
  });

  it('renders article excerpt as first paragraph', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getAllByText('An excerpt about something interesting.').length).toBeGreaterThan(0);
    });
  });

  it('renders footer with article URL', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('https://essays.co/test')).toBeTruthy();
    });
  });

  it('renders author initials avatar', async () => {
    renderScreen();
    await waitFor(() => {
      expect(screen.getByText('JD')).toBeTruthy();
    });
  });

  it('writes progress to store after scroll settles', async () => {
    jest.useFakeTimers();
    renderScreen();
    await waitFor(() => screen.getByText('Test Article'));

    const scrollView = screen.getByTestId('reader-scroll');
    act(() => {
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 500 },
          contentSize: { height: 2000 },
          layoutMeasurement: { height: 700 },
        },
      });
    });
    act(() => { jest.advanceTimersByTime(600); });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'linkstock:items',
        expect.any(String)
      );
    });
    jest.useRealTimers();
  });

  it('double-tap toggles highlight on a paragraph', async () => {
    renderScreen();
    await waitFor(() => screen.getByText('Test Article'));

    const para = screen.getByText(/The most honest thing we can do/);
    fireEvent.press(para);
    fireEvent.press(para);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'linkstock:items',
        expect.stringContaining('"highlights"')
      );
    });
  });
});
