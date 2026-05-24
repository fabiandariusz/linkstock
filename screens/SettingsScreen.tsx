import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';

export function SettingsScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.paper }]}>
      <Text style={{ color: colors.ink }}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
