import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { SoftCard } from '../components/SoftCard';

function renderCard(props: Omit<React.ComponentProps<typeof SoftCard>, 'children'> & { label?: string } = {}) {
  const { label = 'Content', ...rest } = props;
  return render(
    <ThemeProvider>
      <SoftCard {...rest}>
        <Text>{label}</Text>
      </SoftCard>
    </ThemeProvider>
  );
}

describe('SoftCard', () => {
  it('renders its children', () => {
    renderCard({ label: 'Card content' });
    expect(screen.getByText('Card content')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    renderCard({ onPress });
    fireEvent.press(screen.getByText('Content'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders without onPress as a plain view', () => {
    expect(() => renderCard()).not.toThrow();
  });
});
