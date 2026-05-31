import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { ShareExtensionRoot } from '../share-extension/ShareExtensionRoot';

let mockAppend: jest.Mock;
let mockDrain: jest.Mock;

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
  beforeEach(() => {
    mockAppend.mockClear();
    mockDrain.mockClear();
    AsyncStorage.setItem.mockClear();
  });

  test('save appends to outbox and calls completeRequest("saved")', async () => {
    jest.useFakeTimers();
    const completeRequest = jest.fn();
    renderRoot({ completeRequest });

    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await act(async () => {});

    expect(mockAppend).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(mockAppend.mock.calls[0][0]);
    expect(payload).toMatchObject({
      url: 'https://shared.example/article',
      title: 'Shared Article',
      tags: [],
      collectionId: null,
    });
    expect(typeof payload.createdAt).toBe('string');

    const itemsWritten = AsyncStorage.setItem.mock.calls.some(
      ([k]: [string]) => k === 'linkstock:items'
    );
    expect(itemsWritten).toBe(false);

    await act(async () => { jest.advanceTimersByTime(1100); });
    expect(completeRequest).toHaveBeenCalledWith('saved');
    jest.useRealTimers();
  });

  test('Cancel calls completeRequest("cancelled") without touching outbox', () => {
    const completeRequest = jest.fn();
    renderRoot({ completeRequest });

    fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(completeRequest).toHaveBeenCalledWith('cancelled');
    expect(mockAppend).not.toHaveBeenCalled();
  });

  test('cold-start: appends even when shared storage is empty', async () => {
    jest.useFakeTimers();
    AsyncStorage.getItem.mockImplementationOnce(async () => null);
    AsyncStorage.getItem.mockImplementationOnce(async () => null);
    const completeRequest = jest.fn();
    renderRoot({ completeRequest, initialUrl: 'https://cold.example/p', initialTitle: 'Cold' });

    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await act(async () => {});

    expect(mockAppend).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mockAppend.mock.calls[0][0])).toMatchObject({
      url: 'https://cold.example/p',
      title: 'Cold',
    });

    await act(async () => { jest.advanceTimersByTime(1100); });
    expect(completeRequest).toHaveBeenCalledWith('saved');
    jest.useRealTimers();
  });
});
