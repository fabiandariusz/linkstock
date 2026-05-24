import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../hooks/ThemeContext';

function TokenDisplay() {
  const theme = useTheme();
  return (
    <>
      <Text testID="paper">{theme.colors.paper}</Text>
      <Text testID="accent">{theme.colors.accent}</Text>
      <Text testID="ink">{theme.colors.ink}</Text>
    </>
  );
}

describe('ThemeContext', () => {
  it('provides correct design token values to consumers', () => {
    render(
      <ThemeProvider>
        <TokenDisplay />
      </ThemeProvider>
    );

    expect(screen.getByTestId('paper').props.children).toBe('#f1e6cb');
    expect(screen.getByTestId('accent').props.children).toBe('#8b3a2e');
    expect(screen.getByTestId('ink').props.children).toBe('#2a2218');
  });

  it('throws when useTheme is called outside ThemeProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TokenDisplay />)).toThrow();
    spy.mockRestore();
  });
});
