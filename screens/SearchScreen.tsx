import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../hooks/ThemeContext';
import { SectionLabel } from '../components/SectionLabel';
import { Pill } from '../components/Pill';
import { ListRow } from '../components/ListRow';
import { IcSearch, IcClock, IcX } from '../components/icons';
import { swatchForUrl } from '../store/seedData';
import type { Item } from '../store/store';

const ITEMS_KEY = 'linkstock:items';
const RECENT_KEY = 'linkstock:recentSearches';
const MAX_RECENT = 8;

const SUGGESTIONS = ['video', 'unread', 'min:10', 'tag:design', 'site:substack.com', 'highlight:has'];

function applyQuery(items: Item[], q: string): Item[] {
  const trimmed = q.trim();
  if (!trimmed) return [];

  if (trimmed === 'unread') return items.filter(i => i.unread);
  if (trimmed === 'video') return items.filter(i => i.kind === 'video');
  if (trimmed === 'highlight:has') return items.filter(i => i.highlights.length > 0);

  const tagMatch = trimmed.match(/^tag:(.+)$/i);
  if (tagMatch) {
    const tag = tagMatch[1].toLowerCase();
    return items.filter(i => i.tags.some(t => t.toLowerCase() === tag));
  }

  const minMatch = trimmed.match(/^min:(\d+)$/i);
  if (minMatch) {
    const n = parseInt(minMatch[1], 10);
    return items.filter(i => i.minutes >= n);
  }

  const siteMatch = trimmed.match(/^site:(.+)$/i);
  if (siteMatch) {
    const domain = siteMatch[1].toLowerCase();
    return items.filter(i => i.site.toLowerCase().includes(domain));
  }

  const lower = trimmed.toLowerCase();
  return items.filter(
    i =>
      i.title.toLowerCase().includes(lower) ||
      i.excerpt.toLowerCase().includes(lower) ||
      i.author.toLowerCase().includes(lower) ||
      i.site.toLowerCase().includes(lower),
  );
}

function savedLabel(isoString: string): string {
  const diffH = Math.floor((Date.now() - new Date(isoString).getTime()) / 3_600_000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'Yesterday';
  if (diffD < 7) return `${diffD}d ago`;
  return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

type Props = {
  onOpenItem?: (id: string) => void;
};

export function SearchScreen({ onOpenItem }: Props) {
  const { colors, fonts } = useTheme();
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState<string[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      const [raw, recentRaw] = await Promise.all([
        AsyncStorage.getItem(ITEMS_KEY),
        AsyncStorage.getItem(RECENT_KEY),
      ]);
      setItems(raw ? JSON.parse(raw) : []);
      setRecents(recentRaw ? JSON.parse(recentRaw) : []);
    }
    load();
  }, []);

  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
    if (!text.trim()) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setRecents(prev => {
        const next = [text, ...prev.filter(r => r !== text)].slice(0, MAX_RECENT);
        AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
        return next;
      });
    }, 500);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const handleRecentPress = useCallback((r: string) => {
    setQuery(r);
  }, []);

  const results = applyQuery(items, query);
  const hasQuery = query.trim().length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.paper }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.muted, fontFamily: fonts.mono }]}>
          {`Search · ${items.length} items indexed`}
        </Text>
        <Text style={[styles.title, { color: colors.ink }]}>What are you looking for?</Text>
      </View>

      {/* Search field */}
      <View style={[styles.fieldWrap, { backgroundColor: colors.card, borderColor: colors.rule }]}>
        <IcSearch size={18} color={colors.muted} />
        <TextInput
          style={[styles.input, { color: colors.ink, fontFamily: fonts.sans }]}
          placeholder="Search titles, words, sites…"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={handleChangeText}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {hasQuery ? (
          <TouchableOpacity onPress={handleClear} accessibilityLabel="Clear search">
            <IcX size={16} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Body */}
      {!hasQuery ? (
        <ScrollView contentContainerStyle={styles.preSearch}>
          {recents.length > 0 ? (
            <>
              <SectionLabel>Recent searches</SectionLabel>
              {recents.map((r, i) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.recentRow,
                    i < recents.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.ruleSoft },
                  ]}
                  onPress={() => handleRecentPress(r)}
                >
                  <IcClock size={16} color={colors.muted} />
                  <Text style={[styles.recentLabel, { color: colors.ink2 }]}>{r}</Text>
                  <Text style={[styles.recentArrow, { color: colors.muted, fontFamily: fonts.mono }]}>↗</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : null}

          <SectionLabel style={{ marginTop: recents.length > 0 ? 18 : 0 }}>Try searching</SectionLabel>
          <View style={styles.suggestions}>
            {SUGGESTIONS.map(s => (
              <Pill key={s} onPress={() => handleChangeText(s)}>{s}</Pill>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <SectionLabel>
              {`${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`}
            </SectionLabel>
          }
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.muted }]}>Nothing on that shelf yet.</Text>
          }
          renderItem={({ item, index }) => (
            <ListRow
              title={item.title}
              excerpt={item.excerpt}
              site={item.site}
              minutes={item.minutes}
              saved={savedLabel(item.savedAt)}
              swatch={swatchForUrl(item.url)}
              kind={item.kind}
              progress={item.progress}
              unread={item.unread}
              onPress={() => onOpenItem?.(item.id)}
              last={index === results.length - 1}
            />
          )}
          contentContainerStyle={styles.results}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 54,
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Newsreader',
    fontWeight: '500',
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -0.4,
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 22,
    marginTop: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  preSearch: {
    paddingHorizontal: 22,
    paddingBottom: 120,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  recentLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DM Sans',
  },
  recentArrow: {
    fontSize: 10.5,
    letterSpacing: 0.1,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  results: {
    paddingBottom: 120,
  },
  empty: {
    padding: 40,
    textAlign: 'center',
    fontFamily: 'Newsreader',
    fontStyle: 'italic',
    fontSize: 16,
  },
});
