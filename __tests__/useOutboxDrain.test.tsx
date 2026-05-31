import React from 'react';
import { View, AppState } from 'react-native';
import { render, act } from '@testing-library/react-native';

let mockAppend: jest.Mock;
let mockDrain: jest.Mock;
const mockAppStateRef: { listener: ((s: string) => void) | null } = { listener: null };

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  mockAppend = jest.fn().mockResolvedValue(undefined);
  mockDrain = jest.fn();
  RN.NativeModules.Outbox = { append: mockAppend, drain: mockDrain };
  return RN;
});

jest.mock('@react-native-async-storage/async-storage', () => {
  const memStore: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => memStore[key] ?? null),
      setItem: jest.fn(async (key: string, value: string) => { memStore[key] = value; }),
    },
  };
});

const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const { useOutboxDrain } = require('../hooks/useOutboxDrain');

function Harness({ onDrained }: { onDrained: () => void }) {
  useOutboxDrain(onDrained);
  return <View />;
}

const ENTRY = {
  url: 'https://shared.example/x',
  title: 'X',
  tags: ['t'],
  collectionId: null,
  createdAt: '2026-05-31T00:00:00.000Z',
};

describe('useOutboxDrain', () => {
  beforeEach(() => {
    mockAppend.mockClear();
    mockDrain.mockReset();
    mockAppStateRef.listener = null;
    AsyncStorage.setItem.mockClear();
    (AppState.addEventListener as jest.Mock).mockReset();
    (AppState.addEventListener as jest.Mock).mockImplementation((_event: string, cb: (s: string) => void) => {
      mockAppStateRef.listener = cb;
      return { remove: jest.fn() };
    });
  });

  test('on mount: drains and saves each entry into the store, then calls onDrained', async () => {
    mockDrain.mockResolvedValueOnce([ENTRY, { ...ENTRY, url: 'https://shared.example/y' }]);
    const onDrained = jest.fn();

    render(<Harness onDrained={onDrained} />);
    await act(async () => {});

    const writes = AsyncStorage.setItem.mock.calls.filter(([k]: [string]) => k === 'linkstock:items');
    expect(writes.length).toBeGreaterThan(0);
    const final = JSON.parse(writes[writes.length - 1][1]);
    const urls = final.map((i: { url: string }) => i.url);
    expect(urls).toEqual(expect.arrayContaining([
      'https://shared.example/x',
      'https://shared.example/y',
    ]));
    expect(onDrained).toHaveBeenCalledTimes(1);
  });

  test('on AppState active: drains again', async () => {
    mockDrain.mockResolvedValueOnce([]);
    const onDrained = jest.fn();

    render(<Harness onDrained={onDrained} />);
    await act(async () => {});

    mockDrain.mockResolvedValueOnce([ENTRY]);
    await act(async () => { mockAppStateRef.listener!('active'); });
    await act(async () => {});

    expect(mockDrain).toHaveBeenCalledTimes(2);
    expect(onDrained).toHaveBeenCalledTimes(1);
  });

  test('empty outbox: does not call onDrained', async () => {
    mockDrain.mockResolvedValueOnce([]);
    const onDrained = jest.fn();

    render(<Harness onDrained={onDrained} />);
    await act(async () => {});

    expect(onDrained).not.toHaveBeenCalled();
  });
});
