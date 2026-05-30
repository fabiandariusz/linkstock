import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
  },
}));
import { StacksScreen }   from '../screens/StacksScreen';
import { ShelvesScreen }  from '../screens/ShelvesScreen';
import { SearchScreen }   from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Placeholder screens', () => {
  it('StacksScreen renders without crashing', () => {
    expect(() => wrap(<StacksScreen />)).not.toThrow();
  });

  it('ShelvesScreen renders without crashing', () => {
    expect(() => wrap(<ShelvesScreen />)).not.toThrow();
  });

  it('SearchScreen renders without crashing', () => {
    expect(() => wrap(<SearchScreen />)).not.toThrow();
  });

  it('SettingsScreen renders without crashing', () => {
    expect(() => wrap(<SettingsScreen />)).not.toThrow();
  });
});
