import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';

type Props = {
  children: React.ReactNode;
};

export function SectionLabel({ children }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.muted }]}>{children}</Text>
      <View style={[styles.rule, { backgroundColor: colors.ruleSoft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 10,
    gap: 10,
  },
  label: {
    fontFamily: 'DM Mono',
    fontSize: 10.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  rule: {
    flex: 1,
    height: 1,
  },
});
