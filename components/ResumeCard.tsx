import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';
import { SoftCard } from './SoftCard';

type Props = {
  title: string;
  excerpt: string;
  site: string;
  minutes: number;
  progress: number;
  swatch: string;
  onPress?: () => void;
};

export function ResumeCard({ title, excerpt, site, minutes, progress, swatch, onPress }: Props) {
  const { colors } = useTheme();
  const minutesLeft = Math.max(1, Math.round((1 - progress) * minutes));

  return (
    <SoftCard onPress={onPress} style={styles.card}>
      <View style={[styles.blob, { backgroundColor: swatch }]} />

      <Text style={[styles.eyebrow, { color: colors.accent }]}>
        Pick up where you left off
      </Text>
      <Text style={[styles.title, { color: colors.ink }]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[styles.excerpt, { color: colors.ink2 }]} numberOfLines={2}>
        "{excerpt.slice(0, 96)}…"
      </Text>

      <View style={styles.footer}>
        <Text style={[styles.meta, { color: colors.muted }]}>{site}</Text>
        <Text style={[styles.metaDot, { color: colors.muted }]}>·</Text>
        <Text style={[styles.meta, { color: colors.muted }]}>{minutesLeft} min left</Text>
        <View style={styles.spacer} />
        <View style={[styles.progressTrack, { backgroundColor: colors.ruleSoft }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` as any, backgroundColor: colors.accent },
            ]}
          />
        </View>
      </View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    right: -28,
    top: -28,
    width: 130,
    height: 130,
    borderRadius: 999,
    opacity: 0.18,
  },
  eyebrow: {
    fontFamily: 'DM Mono',
    fontSize: 10.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Newsreader',
    fontWeight: '500',
    fontSize: 22,
    lineHeight: 26,
    marginTop: 8,
    marginBottom: 6,
  },
  excerpt: {
    fontFamily: 'Newsreader',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  meta: {
    fontFamily: 'DM Mono',
    fontSize: 12,
  },
  metaDot: {
    fontSize: 12,
  },
  spacer: {
    flex: 1,
  },
  progressTrack: {
    width: 86,
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%' as any,
    borderRadius: 999,
  },
});
