import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { ListRow } from '../components/ListRow';

const BASE_PROPS = {
  title: 'The Slow Web',
  excerpt: 'How slowing down changed the way I read.',
  site: 'essays.co',
  minutes: 8,
  saved: '2h ago',
  swatch: '#d9aa5c',
};

function renderRow(overrides: Partial<React.ComponentProps<typeof ListRow>> = {}) {
  return render(
    <ThemeProvider>
      <ListRow {...BASE_PROPS} {...overrides} />
    </ThemeProvider>
  );
}

describe('ListRow', () => {
  it('renders title, site and minutes', () => {
    renderRow();
    expect(screen.getByText('The Slow Web')).toBeTruthy();
    expect(screen.getByText('essays.co')).toBeTruthy();
    expect(screen.getByText('8 min')).toBeTruthy();
  });

  it('shows excerpt in comfortable (default) density', () => {
    renderRow({ compact: false });
    expect(screen.getByText('How slowing down changed the way I read.')).toBeTruthy();
  });

  it('hides excerpt in compact density', () => {
    renderRow({ compact: true });
    expect(screen.queryByText('How slowing down changed the way I read.')).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    renderRow({ onPress });
    fireEvent.press(screen.getByText('The Slow Web'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders unread indicator when unread is true', () => {
    expect(() => renderRow({ unread: true })).not.toThrow();
  });

  it('renders video kind without error', () => {
    expect(() => renderRow({ kind: 'video' })).not.toThrow();
  });

  it('renders in-progress state without error', () => {
    expect(() => renderRow({ progress: 0.45 })).not.toThrow();
  });
});
