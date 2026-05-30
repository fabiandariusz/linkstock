import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { SectionLabel } from '../components/SectionLabel';

describe('SectionLabel', () => {
  it('renders its children', () => {
    render(
      <ThemeProvider>
        <SectionLabel>Saved this week</SectionLabel>
      </ThemeProvider>
    );
    expect(screen.getByText('Saved this week')).toBeTruthy();
  });

  it('renders without error', () => {
    expect(() =>
      render(
        <ThemeProvider>
          <SectionLabel>Collections</SectionLabel>
        </ThemeProvider>
      )
    ).not.toThrow();
  });
});
