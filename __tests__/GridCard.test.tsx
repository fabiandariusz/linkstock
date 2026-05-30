import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { GridCard } from '../components/GridCard';

const BASE_PROPS = {
  title: 'The Slow Web',
  site: 'essays.co',
  minutes: 8,
  swatch: '#d9aa5c',
};

function renderCard(overrides: Partial<React.ComponentProps<typeof GridCard>> = {}) {
  return render(
    <ThemeProvider>
      <GridCard {...BASE_PROPS} {...overrides} />
    </ThemeProvider>
  );
}

describe('GridCard', () => {
  it('renders title, site and minutes', () => {
    renderCard();
    expect(screen.getByText('The Slow Web')).toBeTruthy();
    expect(screen.getByText('essays.co')).toBeTruthy();
    expect(screen.getByText('8 min')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    renderCard({ onPress });
    fireEvent.press(screen.getByText('The Slow Web'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders video kind without error', () => {
    expect(() => renderCard({ kind: 'video' })).not.toThrow();
  });

  it('renders in-progress state without error', () => {
    expect(() => renderCard({ progress: 0.5 })).not.toThrow();
  });
});
