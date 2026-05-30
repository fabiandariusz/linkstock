import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import ShareExtension from '../share-extension/ShareExtension';

jest.mock('expo-share-extension', () => ({
  close: jest.fn(),
}));

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
  test('maps url + preprocessingResults.title into ShareExtensionRoot and calls close() on save', async () => {
    jest.useFakeTimers();
    (close as jest.Mock).mockClear();
    AsyncStorage.setItem.mockClear();

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
    const saved = AsyncStorage.setItem.mock.calls.find(([k]: [string]) => k === 'linkstock:items');
    expect(saved).toBeTruthy();
    jest.useRealTimers();
  });

  test('handles missing url/title gracefully (no crash)', () => {
    expect(() => render(<ShareExtension />)).not.toThrow();
    expect(screen.getByPlaceholderText('Paste a URL…').props.value).toBe('');
  });
});
