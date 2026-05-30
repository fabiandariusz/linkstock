import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';

type Props = {
  title: string;
  excerpt?: string;
  site: string;
  minutes: number;
  saved: string;
  swatch: string;
  kind?: 'article' | 'video';
  progress?: number;
  unread?: boolean;
  compact?: boolean;
  onPress?: () => void;
  last?: boolean;
};

export function ListRow({
  title, excerpt, site, minutes, saved, swatch, kind, progress = 0,
  unread, compact = false, onPress, last = false,
}: Props) {
  const { colors } = useTheme();
  const thumbSize = compact ? 38 : 52;
  const inProgress = progress > 0 && progress < 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.row,
        { paddingVertical: compact ? 12 : 16 },
        !last && { borderBottomWidth: 1, borderBottomColor: colors.ruleSoft },
      ]}
    >
      <View style={[styles.thumb, { width: thumbSize, height: thumbSize, backgroundColor: swatch }]}>
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
        <Text
          style={[styles.title, { color: colors.ink, fontSize: compact ? 15 : 17 }]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {!compact && excerpt ? (
          <Text style={[styles.excerpt, { color: colors.ink2 }]} numberOfLines={1}>
            {excerpt}
          </Text>
        ) : null}
        <View style={[styles.meta, { marginTop: compact ? 3 : 8 }]}>
          <Text style={[styles.metaText, { color: colors.muted }]}>{site}</Text>
          <Text style={[styles.metaDot, { color: colors.muted }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.muted }]}>{minutes} min</Text>
          <Text style={[styles.metaDot, { color: colors.muted }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.muted }]}>{saved}</Text>
          {unread && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 22,
  },
  thumb: {
    borderRadius: 10,
    flexShrink: 0,
    overflow: 'hidden',
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
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'rgba(255,255,255,0.95)',
  },
  progressBarTrack: {
    position: 'absolute',
    left: 4,
    right: 4,
    bottom: 4,
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
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: 'Newsreader',
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  excerpt: {
    fontFamily: 'Newsreader',
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  metaText: {
    fontFamily: 'DM Mono',
    fontSize: 10.5,
    letterSpacing: 0.5,
  },
  metaDot: {
    opacity: 0.4,
    fontSize: 10.5,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginLeft: 'auto' as any,
  },
});
