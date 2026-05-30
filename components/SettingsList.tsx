import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';
import { Toggle } from './Toggle';

export type SettingsRow = {
  label: string;
  detail?: string;
  toggle?: boolean;
  onToggle?: (value: boolean) => void;
};

type Props = {
  rows: SettingsRow[];
};

export function SettingsList({ rows }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.ruleSoft }]}>
      {rows.map((row, i) => (
        <View
          key={i}
          style={[
            styles.row,
            i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.ruleSoft },
          ]}
        >
          <Text style={[styles.label, { color: colors.ink }]}>{row.label}</Text>

          {row.detail !== undefined && (
            <Text style={[styles.detail, { color: colors.muted }]}>{row.detail}</Text>
          )}

          {row.toggle !== undefined && (
            <Toggle on={row.toggle} onToggle={row.onToggle} />
          )}

          {row.detail === undefined && row.toggle === undefined && (
            <Text style={[styles.chevron, { color: colors.muted2 }]}>›</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  label: {
    flex: 1,
    fontFamily: 'Newsreader',
    fontSize: 15,
  },
  detail: {
    fontFamily: 'DM Mono',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  chevron: {
    fontSize: 20,
    lineHeight: 22,
  },
});
