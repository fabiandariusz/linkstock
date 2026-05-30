import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  active?: boolean;
  accessibilityLabel?: string;
};

export function IconBtn({ children, onPress, active = false, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.btn,
        {
          backgroundColor: active ? colors.accent : 'transparent',
          borderColor: active ? colors.accent : colors.rule,
        },
      ]}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
