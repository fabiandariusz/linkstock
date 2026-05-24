import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

// Mock expo-font so tests never touch native modules
jest.mock('expo-font', () => ({
  useFonts: jest.fn(),
}));

import * as ExpoFont from 'expo-font';
import { AppFontLoader } from '../hooks/AppFontLoader';

const mockUseFonts = ExpoFont.useFonts as jest.Mock;

describe('AppFontLoader', () => {
  it('renders nothing while fonts are loading', () => {
    mockUseFonts.mockReturnValue([false, null]);
    render(<AppFontLoader fallback={null}><Text testID="content">Ready</Text></AppFontLoader>);
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('renders children once all fonts are loaded', () => {
    mockUseFonts.mockReturnValue([true, null]);
    render(<AppFontLoader fallback={null}><Text testID="content">Ready</Text></AppFontLoader>);
    expect(screen.getByTestId('content')).toBeTruthy();
  });

  it('requests all 6 required font families', () => {
    mockUseFonts.mockReturnValue([true, null]);
    render(<AppFontLoader fallback={null}><Text>x</Text></AppFontLoader>);

    const fontMap = mockUseFonts.mock.calls[0][0];
    const keys = Object.keys(fontMap);

    const required = [
      'Newsreader', 'Lora', 'CrimsonPro', 'EBGaramond', 'DMSans', 'DMMono',
    ];
    required.forEach(family => {
      expect(keys.some(k => k.startsWith(family))).toBe(true);
    });
  });
});
