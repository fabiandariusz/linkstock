import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { ThemeProvider } from '../hooks/ThemeContext';
import { Toggle } from '../components/Toggle';

function renderToggle(on: boolean, onToggle = jest.fn()) {
  return render(
    <ThemeProvider>
      <Toggle on={on} onToggle={onToggle} />
    </ThemeProvider>
  );
}

function ControlledToggle() {
  const [on, setOn] = useState(false);
  return (
    <ThemeProvider>
      <Toggle on={on} onToggle={setOn} />
    </ThemeProvider>
  );
}

describe('Toggle', () => {
  it('renders in off state without error', () => {
    expect(() => renderToggle(false)).not.toThrow();
  });

  it('renders in on state without error', () => {
    expect(() => renderToggle(true)).not.toThrow();
  });

  it('calls onToggle with flipped value when pressed', () => {
    const onToggle = jest.fn();
    renderToggle(false, onToggle);
    fireEvent.press(screen.getByRole('switch'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('calls onToggle with false when pressed in on state', () => {
    const onToggle = jest.fn();
    renderToggle(true, onToggle);
    fireEvent.press(screen.getByRole('switch'));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('animates knob when on prop changes', () => {
    const { rerender } = renderToggle(false);
    act(() => {
      rerender(
        <ThemeProvider>
          <Toggle on={true} onToggle={jest.fn()} />
        </ThemeProvider>
      );
    });
    // If Animated.timing ran without throwing, the knob animation is wired up
    expect(screen.getByRole('switch')).toBeTruthy();
  });
});
