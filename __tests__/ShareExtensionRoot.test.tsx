import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { ShareExtensionRoot } from '../share-extension/ShareExtensionRoot';

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

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

function renderRoot(props: Partial<React.ComponentProps<typeof ShareExtensionRoot>> = {}) {
  return render(
    <ThemeProvider>
      <ShareExtensionRoot
        initialUrl="https://shared.example/article"
        initialTitle="Shared Article"
        completeRequest={jest.fn()}
        {...props}
      />
    </ThemeProvider>
  );
}

describe('ShareExtensionRoot', () => {
  test('save writes item to store and calls completeRequest("saved")', async () => {
    jest.useFakeTimers();
    const completeRequest = jest.fn();
    renderRoot({ completeRequest });

    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await act(async () => {});

    const saved = AsyncStorage.setItem.mock.calls.find(
      ([key]: [string]) => key === 'linkstock:items'
    );
    expect(saved).toBeTruthy();
    const items = JSON.parse(saved![1]);
    expect(items[0]).toMatchObject({
      url: 'https://shared.example/article',
      title: 'Shared Article',
    });

    await act(async () => { jest.advanceTimersByTime(1100); });
    expect(completeRequest).toHaveBeenCalledWith('saved');
    jest.useRealTimers();
  });

  test('Cancel calls completeRequest("cancelled") without writing to store', () => {
    const completeRequest = jest.fn();
    AsyncStorage.setItem.mockClear();
    renderRoot({ completeRequest });

    fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(completeRequest).toHaveBeenCalledWith('cancelled');
    const itemsWritten = AsyncStorage.setItem.mock.calls.some(
      ([k]: [string]) => k === 'linkstock:items'
    );
    expect(itemsWritten).toBe(false);
  });

  test('cold-start: saves successfully when shared storage is empty', async () => {
    jest.useFakeTimers();
    AsyncStorage.getItem.mockImplementationOnce(async () => null);
    AsyncStorage.getItem.mockImplementationOnce(async () => null);
    const completeRequest = jest.fn();
    renderRoot({ completeRequest, initialUrl: 'https://cold.example/p', initialTitle: 'Cold' });

    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await act(async () => {});

    const saved = AsyncStorage.setItem.mock.calls.find(
      ([key]: [string]) => key === 'linkstock:items'
    );
    expect(saved).toBeTruthy();
    const items = JSON.parse(saved![1]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ url: 'https://cold.example/p', title: 'Cold' });

    await act(async () => { jest.advanceTimersByTime(1100); });
    expect(completeRequest).toHaveBeenCalledWith('saved');
    jest.useRealTimers();
  });
});
