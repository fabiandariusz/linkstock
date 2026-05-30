import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { IconBtn } from '../components/IconBtn';

function renderBtn(props: Partial<React.ComponentProps<typeof IconBtn>> = {}) {
  return render(
    <ThemeProvider>
      <IconBtn {...props}>
        <Text>icon</Text>
      </IconBtn>
    </ThemeProvider>
  );
}

describe('IconBtn', () => {
  it('renders its children', () => {
    renderBtn();
    expect(screen.getByText('icon')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    renderBtn({ onPress });
    fireEvent.press(screen.getByText('icon'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders in active state without error', () => {
    expect(() => renderBtn({ active: true })).not.toThrow();
  });

  it('renders in inactive state without error', () => {
    expect(() => renderBtn({ active: false })).not.toThrow();
  });
});
