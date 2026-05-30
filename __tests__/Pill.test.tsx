import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { Pill } from '../components/Pill';

function renderPill(props: React.ComponentProps<typeof Pill>) {
  return render(<ThemeProvider><Pill {...props} /></ThemeProvider>);
}

describe('Pill', () => {
  it('renders its children', () => {
    renderPill({ children: 'All' });
    expect(screen.getByText('All')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    renderPill({ children: 'Unread', onPress });
    fireEvent.press(screen.getByText('Unread'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders in active state without error', () => {
    expect(() => renderPill({ children: 'Today', active: true })).not.toThrow();
  });

  it('renders in inactive state without error', () => {
    expect(() => renderPill({ children: 'Video', active: false })).not.toThrow();
  });
});
