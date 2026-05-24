import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';

export function StacksScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.paper }]}>
      <Text style={{ color: colors.ink }}>Stacks</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
