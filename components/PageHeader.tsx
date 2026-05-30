import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';

type Props = {
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
  sub?: string;
};

export function PageHeader({ eyebrow, title, right, sub }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {eyebrow ? (
        <Text style={[styles.eyebrow, { color: colors.muted }]}>{eyebrow}</Text>
      ) : null}
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.ink }]} numberOfLines={3}>
          {title}
        </Text>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {sub ? (
        <Text style={[styles.sub, { color: colors.ink2 }]}>{sub}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 54,
    paddingHorizontal: 22,
    paddingBottom: 14,
  },
  eyebrow: {
    fontFamily: 'DM Mono',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: 'Newsreader',
    fontWeight: '500',
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -0.4,
  },
  right: {
    marginBottom: 4,
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'DM Sans',
  },
});
