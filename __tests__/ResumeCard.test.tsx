import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { ResumeCard } from '../components/ResumeCard';

const BASE_PROPS = {
  title: 'The Slow Web',
  excerpt: 'How slowing down changed the way I read and think about speed.',
  site: 'essays.co',
  minutes: 8,
  progress: 0.45,
  swatch: '#d9aa5c',
};

function renderCard(overrides: Partial<React.ComponentProps<typeof ResumeCard>> = {}) {
  return render(
    <ThemeProvider>
      <ResumeCard {...BASE_PROPS} {...overrides} />
    </ThemeProvider>
  );
}

describe('ResumeCard', () => {
  it('renders title and site', () => {
    renderCard();
    expect(screen.getByText('The Slow Web')).toBeTruthy();
    expect(screen.getByText('essays.co')).toBeTruthy();
  });

  it('shows minutes remaining based on progress', () => {
    renderCard({ minutes: 10, progress: 0.5 });
    expect(screen.getByText('5 min left')).toBeTruthy();
  });

  it('shows the resume eyebrow label', () => {
    renderCard();
    expect(screen.getByText('Pick up where you left off')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    renderCard({ onPress });
    fireEvent.press(screen.getByText('The Slow Web'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
