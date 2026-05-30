import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';

type Props = {
  on: boolean;
  onToggle?: (value: boolean) => void;
};

export function Toggle({ on, onToggle }: Props) {
  const { colors } = useTheme();
  const knob = useRef(new Animated.Value(on ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(knob, {
      toValue: on ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [on]);

  const left = knob.interpolate({ inputRange: [0, 1], outputRange: [2, 18] });

  return (
    <TouchableOpacity
      onPress={() => onToggle?.(!on)}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      activeOpacity={0.85}
      style={[
        styles.track,
        { backgroundColor: on ? colors.accent : colors.rule },
      ]}
    >
      <Animated.View style={[styles.knob, { left }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 38,
    height: 22,
    borderRadius: 999,
    position: 'relative',
  },
  knob: {
    position: 'absolute',
    top: 2,
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#fbf2dc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
});
