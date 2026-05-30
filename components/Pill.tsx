import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';

type Props = {
  children: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
};

export function Pill({ children, active = false, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.pill,
        {
          borderColor: active ? colors.accent : colors.rule,
          backgroundColor: active ? colors.accent : 'transparent',
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: active ? colors.card2 : colors.ink2 },
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  label: {
    fontFamily: 'DM Sans',
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
