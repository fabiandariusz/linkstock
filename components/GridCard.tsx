import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';
import { SoftCard } from './SoftCard';

type Props = {
  title: string;
  site: string;
  minutes: number;
  swatch: string;
  kind?: 'article' | 'video';
  progress?: number;
  onPress?: () => void;
};

export function GridCard({ title, site, minutes, swatch, kind, progress = 0, onPress }: Props) {
  const { colors } = useTheme();
  const inProgress = progress > 0 && progress < 1;

  return (
    <SoftCard onPress={onPress} style={styles.card}>
      <View style={[styles.header, { backgroundColor: swatch }]}>
        {kind === 'video' && (
          <View style={styles.playOverlay}>
            <View style={styles.playTriangle} />
          </View>
        )}
        {inProgress && (
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` as any }]} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.ink }]} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: colors.muted }]}>{minutes} min</Text>
          <Text style={[styles.metaDot, { color: colors.muted }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.muted }]} numberOfLines={1}>
            {site}
          </Text>
        </View>
      </View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    padding: 0,
  },
  header: {
    height: 96,
    position: 'relative',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderLeftWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'rgba(255,255,255,0.95)',
  },
  progressBarTrack: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%' as any,
    backgroundColor: '#fff',
    borderRadius: 999,
  },
  body: {
    padding: 12,
  },
  title: {
    fontFamily: 'Newsreader',
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: -0.1,
    minHeight: 36,
  },
  meta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  metaText: {
    fontFamily: 'DM Mono',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  metaDot: {
    opacity: 0.4,
    fontSize: 10,
  },
});
