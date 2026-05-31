import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import ShareExtension from '../share-extension/ShareExtension';

let mockAppend: jest.Mock;
let mockDrain: jest.Mock;

jest.mock('expo-share-extension', () => ({
  close: jest.fn(),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  mockAppend = jest.fn().mockResolvedValue(undefined);
  mockDrain = jest.fn().mockResolvedValue([]);
  RN.NativeModules.Outbox = { append: mockAppend, drain: mockDrain };
  return RN;
});

jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => store[key] ?? null),
      setItem: jest.fn(async (key: string, value: string) => { store[key] = value; }),
    },
  };
});

const { close } = require('expo-share-extension');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

describe('ShareExtension adapter', () => {
  beforeEach(() => {
    mockAppend.mockClear();
    mockDrain.mockClear();
    (close as jest.Mock).mockClear();
    AsyncStorage.setItem.mockClear();
  });

  test('maps url + preprocessingResults.title into outbox payload and calls close() on save', async () => {
    jest.useFakeTimers();

    render(
      <ShareExtension
        url="https://safari.example/article"
        preprocessingResults={{ title: 'A Page' }}
      />
    );

    expect(screen.getByPlaceholderText('Paste a URL…').props.value).toBe('https://safari.example/article');
    expect(screen.getByPlaceholderText('Title').props.value).toBe('A Page');

    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await act(async () => {});
    await act(async () => { jest.advanceTimersByTime(1100); });

    expect(close).toHaveBeenCalledTimes(1);
    expect(mockAppend).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mockAppend.mock.calls[0][0])).toMatchObject({
      url: 'https://safari.example/article',
      title: 'A Page',
    });
    const wroteItems = AsyncStorage.setItem.mock.calls.some(([k]: [string]) => k === 'linkstock:items');
    expect(wroteItems).toBe(false);
    jest.useRealTimers();
  });

  test('handles missing url/title gracefully (no crash)', () => {
    expect(() => render(<ShareExtension />)).not.toThrow();
    expect(screen.getByPlaceholderText('Paste a URL…').props.value).toBe('');
  });
});
