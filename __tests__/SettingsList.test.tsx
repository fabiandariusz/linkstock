import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { SettingsList } from '../components/SettingsList';
import type { SettingsRow } from '../components/SettingsList';

function renderList(rows: SettingsRow[]) {
  return render(
    <ThemeProvider>
      <SettingsList rows={rows} />
    </ThemeProvider>
  );
}

describe('SettingsList', () => {
  it('renders row labels', () => {
    renderList([{ label: 'Reading font' }, { label: 'Default size' }]);
    expect(screen.getByText('Reading font')).toBeTruthy();
    expect(screen.getByText('Default size')).toBeTruthy();
  });

  it('renders detail text when provided', () => {
    renderList([{ label: 'Reading font', detail: 'Newsreader' }]);
    expect(screen.getByText('Newsreader')).toBeTruthy();
  });

  it('renders Toggle for rows with toggle prop', () => {
    renderList([{ label: 'Auto-tag with AI', toggle: true }]);
    expect(screen.getByRole('switch')).toBeTruthy();
  });

  it('renders chevron for plain rows (no detail, no toggle)', () => {
    renderList([{ label: 'Open-source licenses' }]);
    expect(screen.getByText('›')).toBeTruthy();
  });

  it('calls onToggle when Toggle is pressed', () => {
    const onToggle = jest.fn();
    renderList([{ label: 'Save full text', toggle: false, onToggle }]);
    fireEvent.press(screen.getByRole('switch'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
