import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { BottomNav } from '../components/BottomNav';

function renderNav(tab = 'inbox', onTabChange = jest.fn(), onAdd = jest.fn()) {
  return render(
    <ThemeProvider>
      <BottomNav tab={tab} onTabChange={onTabChange} onAdd={onAdd} />
    </ThemeProvider>
  );
}

describe('BottomNav', () => {
  it('renders all 4 tabs with correct labels from the design', () => {
    renderNav();
    expect(screen.getByText('Stacks')).toBeTruthy();
    expect(screen.getByText('Shelves')).toBeTruthy();
    expect(screen.getByText('Search')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('calls onTabChange with the correct tab id when a tab is pressed', () => {
    const onTabChange = jest.fn();
    renderNav('inbox', onTabChange);
    fireEvent.press(screen.getByText('Shelves'));
    expect(onTabChange).toHaveBeenCalledWith('shelves');
  });

  it('calls onAdd when the center add button is pressed', () => {
    const onAdd = jest.fn();
    renderNav('inbox', jest.fn(), onAdd);
    fireEvent.press(screen.getByRole('button', { name: 'Add item' }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
