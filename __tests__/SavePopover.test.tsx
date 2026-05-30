import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { SavePopover } from '../components/SavePopover';

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
const COLLECTIONS_KEY = 'linkstock:collections';

function renderPopover(props: Partial<React.ComponentProps<typeof SavePopover>> = {}) {
  return render(
    <ThemeProvider>
      <SavePopover
        visible={true}
        onClose={jest.fn()}
        onSaved={jest.fn()}
        {...props}
      />
    </ThemeProvider>
  );
}

describe('SavePopover', () => {
  test('renders URL input when visible', () => {
    renderPopover();
    expect(screen.getByPlaceholderText('Paste a URL…')).toBeTruthy();
  });

  test('renders Title input', () => {
    renderPopover();
    expect(screen.getByPlaceholderText('Title')).toBeTruthy();
  });

  beforeEach(async () => {
    await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify([
      { id: 'c1', name: 'Design', emoji: '🎨', hue: 200 },
      { id: 'c2', name: 'Science', emoji: '🔬', hue: 120 },
    ]));
  });

  test('shows collection chips loaded from store', async () => {
    renderPopover();
    await waitFor(() => {
      expect(screen.getByText('🎨 Design')).toBeTruthy();
      expect(screen.getByText('🔬 Science')).toBeTruthy();
    });
  });

  test('renders tag input', () => {
    renderPopover();
    expect(screen.getByPlaceholderText('Tags (comma-separated)')).toBeTruthy();
  });

  test('Save button calls store.saveItem with url, title, collectionId, tags and calls onSaved', async () => {
    const onSaved = jest.fn();
    renderPopover({ onSaved });
    await waitFor(() => screen.getByText('🎨 Design'));

    fireEvent.changeText(screen.getByPlaceholderText('Paste a URL…'), 'https://example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Title'), 'My Article');
    fireEvent.press(screen.getByRole('button', { name: '🎨 Design' }));
    fireEvent.changeText(screen.getByPlaceholderText('Tags (comma-separated)'), 'design, ux');

    fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      const saved = AsyncStorage.setItem.mock.calls.find(
        ([key]: [string]) => key === 'linkstock:items'
      );
      expect(saved).toBeTruthy();
      const items = JSON.parse(saved![1]);
      expect(items[0]).toMatchObject({
        url: 'https://example.com',
        title: 'My Article',
        collectionId: 'c1',
        tags: ['design', 'ux'],
      });
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  test('Cancel calls onClose without saving', async () => {
    const onClose = jest.fn();
    const onSaved = jest.fn();
    AsyncStorage.setItem.mockClear();
    renderPopover({ onClose, onSaved });
    fireEvent.changeText(screen.getByPlaceholderText('Paste a URL…'), 'https://example.com');
    fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSaved).not.toHaveBeenCalled();
    const itemsSaved = AsyncStorage.setItem.mock.calls.some(([k]: [string]) => k === 'linkstock:items');
    expect(itemsSaved).toBe(false);
  });

  test('Save with empty URL does not save or call onSaved', () => {
    const onSaved = jest.fn();
    AsyncStorage.setItem.mockClear();
    renderPopover({ onSaved });
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(onSaved).not.toHaveBeenCalled();
    const itemsSaved = AsyncStorage.setItem.mock.calls.some(([k]: [string]) => k === 'linkstock:items');
    expect(itemsSaved).toBe(false);
  });

  test('tapping a collection chip selects it; tapping again deselects', async () => {
    renderPopover();
    await waitFor(() => screen.getByText('🎨 Design'));
    const chip = screen.getByRole('button', { name: '🎨 Design' });
    expect(chip.props.accessibilityState?.selected).toBe(false);
    fireEvent.press(chip);
    expect(chip.props.accessibilityState?.selected).toBe(true);
    fireEvent.press(chip);
    expect(chip.props.accessibilityState?.selected).toBe(false);
  });
});
