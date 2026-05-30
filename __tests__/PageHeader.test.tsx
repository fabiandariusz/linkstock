import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { PageHeader } from '../components/PageHeader';

function renderHeader(props: React.ComponentProps<typeof PageHeader>) {
  return render(<ThemeProvider><PageHeader {...props} /></ThemeProvider>);
}

describe('PageHeader', () => {
  it('renders the title', () => {
    renderHeader({ title: 'Your stacks.' });
    expect(screen.getByText('Your stacks.')).toBeTruthy();
  });

  it('renders eyebrow when provided', () => {
    renderHeader({ title: 'Title', eyebrow: 'Warehouse · 198 items' });
    expect(screen.getByText('Warehouse · 198 items')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    renderHeader({ title: 'Title', sub: 'Three things picked up where you left off.' });
    expect(screen.getByText('Three things picked up where you left off.')).toBeTruthy();
  });

  it('renders the right slot when provided', () => {
    renderHeader({ title: 'Title', right: <Text>SlotContent</Text> });
    expect(screen.getByText('SlotContent')).toBeTruthy();
  });

  it('renders with only a title without error', () => {
    expect(() => renderHeader({ title: 'Minimal' })).not.toThrow();
  });
});
