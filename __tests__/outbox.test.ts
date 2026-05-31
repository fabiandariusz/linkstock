let mockAppend: jest.Mock;
let mockDrain: jest.Mock;

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  mockAppend = jest.fn().mockResolvedValue(undefined);
  mockDrain = jest.fn();
  RN.NativeModules.Outbox = { append: mockAppend, drain: mockDrain };
  return RN;
});

import { appendOutbox, drainOutbox, OutboxEntry } from '../store/outbox';

const sampleEntry: OutboxEntry = {
  url: 'https://example.com/a',
  title: 'A',
  tags: ['x'],
  collectionId: null,
  createdAt: '2026-05-31T00:00:00.000Z',
};

describe('outbox wrapper', () => {
  beforeEach(() => {
    mockAppend.mockClear();
    mockDrain.mockClear();
  });

  test('appendOutbox stringifies and calls native append', async () => {
    await appendOutbox(sampleEntry);
    expect(mockAppend).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mockAppend.mock.calls[0][0])).toEqual(sampleEntry);
  });

  test('drainOutbox returns parsed entries', async () => {
    mockDrain.mockResolvedValueOnce([sampleEntry, { ...sampleEntry, url: 'https://example.com/b' }]);
    const entries = await drainOutbox();
    expect(entries).toHaveLength(2);
    expect(entries[0].url).toBe('https://example.com/a');
    expect(entries[1].url).toBe('https://example.com/b');
  });

  test('drainOutbox filters out malformed entries', async () => {
    mockDrain.mockResolvedValueOnce([sampleEntry, null, { foo: 'bar' }]);
    const entries = await drainOutbox();
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe(sampleEntry.url);
  });

  test('drainOutbox returns [] when native module returns non-array', async () => {
    mockDrain.mockResolvedValueOnce(null);
    const entries = await drainOutbox();
    expect(entries).toEqual([]);
  });
});
