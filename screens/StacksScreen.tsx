import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../hooks/ThemeContext';
import { PageHeader } from '../components/PageHeader';
import { Pill } from '../components/Pill';
import { ResumeCard } from '../components/ResumeCard';
import { SectionLabel } from '../components/SectionLabel';
import { ListRow } from '../components/ListRow';
import { GridCard } from '../components/GridCard';
import { IconBtn } from '../components/IconBtn';
import { IcGrid, IcRows, IcFilter } from '../components/icons';
import { SEED_ITEMS, swatchForUrl } from '../store/seedData';
import type { Item } from '../store/store';

const VIEW_MODE_KEY = 'linkstock:viewMode';
const DENSITY_KEY = 'linkstock:density';
const ITEMS_KEY = 'linkstock:items';

type ViewMode = 'list' | 'card';
type Density = 'comfortable' | 'compact';
type FilterId = 'all' | 'unread' | 'today' | 'progress' | 'video';

function isToday(isoString: string): boolean {
  const d = new Date(isoString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function savedLabel(isoString: string): string {
  const saved = new Date(isoString);
  const diffMs = Date.now() - saved.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'Yesterday';
  if (diffD < 7) return `${diffD}d ago`;
  return saved.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

type Props = {
  onOpenItem?: (id: string) => void;
  collectionFilter?: string | null;
};

export function StacksScreen({ onOpenItem, collectionFilter }: Props) {
  const { colors } = useTheme();
  const [items, setItems] = useState<Item[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [density, setDensity] = useState<Density>('comfortable');
  const [filter, setFilter] = useState<FilterId>('all');

  useEffect(() => {
    async function init() {
      const [savedView, savedDensity] = await Promise.all([
        AsyncStorage.getItem(VIEW_MODE_KEY),
        AsyncStorage.getItem(DENSITY_KEY),
      ]);
      if (savedView === 'card' || savedView === 'list') setViewMode(savedView);
      if (savedDensity === 'compact' || savedDensity === 'comfortable') setDensity(savedDensity);

      const raw = await AsyncStorage.getItem(ITEMS_KEY);
      let loaded: Item[] = raw ? JSON.parse(raw) : [];
      if (loaded.length === 0) {
        const seeded: Item[] = SEED_ITEMS.map((seed, i) => ({
          ...seed,
          id: `seed-${i}`,
        }));
        await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(seeded));
        loaded = seeded;
      }
      setItems(loaded);
    }
    init();
  }, []);

  const toggleViewMode = useCallback(async () => {
    const next: ViewMode = viewMode === 'list' ? 'card' : 'list';
    setViewMode(next);
    await AsyncStorage.setItem(VIEW_MODE_KEY, next);
  }, [viewMode]);

  const handleOpenItem = useCallback((id: string) => {
    if (onOpenItem) {
      onOpenItem(id);
    } else {
      Alert.alert('Open item', id);
    }
  }, [onOpenItem]);

  const baseItems = collectionFilter ? items.filter(i => i.collectionId === collectionFilter) : items;
  const resumeItem = baseItems.find(i => i.progress > 0 && i.progress < 1);

  const filterDefs: { id: FilterId; label: string; count: number }[] = [
    { id: 'all',      label: 'All',         count: baseItems.length },
    { id: 'unread',   label: 'Unread',      count: baseItems.filter(i => i.unread).length },
    { id: 'today',    label: 'Today',       count: baseItems.filter(i => isToday(i.savedAt)).length },
    { id: 'progress', label: 'In Progress', count: baseItems.filter(i => i.progress > 0 && i.progress < 1).length },
    { id: 'video',    label: 'Video',       count: baseItems.filter(i => i.kind === 'video').length },
  ];

  const filtered = baseItems.filter(it => {
    if (filter === 'unread')   return it.unread;
    if (filter === 'today')    return isToday(it.savedAt);
    if (filter === 'progress') return it.progress > 0 && it.progress < 1;
    if (filter === 'video')    return it.kind === 'video';
    return true;
  });

  const listItems = filtered.filter(i => i.id !== resumeItem?.id);

  return (
    <View style={[styles.root, { backgroundColor: colors.paper }]}>
      <FlatList
        data={viewMode === 'list' ? listItems : undefined}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <PageHeader
              eyebrow={`Inbox · ${items.length} item${items.length !== 1 ? 's' : ''}`}
              title="Your stacks."
              right={
                <View style={styles.headerBtns}>
                  <IconBtn onPress={toggleViewMode}>
                    {viewMode === 'list'
                      ? <IcGrid size={18} color={colors.ink2} />
                      : <IcRows size={18} color={colors.ink2} />}
                  </IconBtn>
                  <IconBtn>
                    <IcFilter size={18} color={colors.ink2} />
                  </IconBtn>
                </View>
              }
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsRow}
            >
              {filterDefs.map(f => (
                <Pill
                  key={f.id}
                  active={filter === f.id}
                  onPress={() => setFilter(f.id)}
                >
                  {`${f.label}  ${f.count}`}
                </Pill>
              ))}
            </ScrollView>

            {resumeItem ? (
              <View style={styles.resumeWrap}>
                <ResumeCard
                  title={resumeItem.title}
                  excerpt={resumeItem.excerpt}
                  site={resumeItem.site}
                  minutes={resumeItem.minutes}
                  progress={resumeItem.progress}
                  swatch={swatchForUrl(resumeItem.url)}
                  onPress={() => handleOpenItem(resumeItem.id)}
                />
              </View>
            ) : null}

            <SectionLabel>Saved this week</SectionLabel>

            {viewMode === 'card' ? (
              <FlatList
                data={listItems}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.gridContent}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.gridCell}>
                    <GridCard
                      title={item.title}
                      site={item.site}
                      minutes={item.minutes}
                      swatch={swatchForUrl(item.url)}
                      kind={item.kind}
                      progress={item.progress}
                      onPress={() => handleOpenItem(item.id)}
                    />
                  </View>
                )}
              />
            ) : null}
          </>
        }
        renderItem={viewMode === 'list' ? ({ item, index }) => (
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
            compact={density === 'compact'}
            onPress={() => handleOpenItem(item.id)}
            last={index === listItems.length - 1}
          />
        ) : undefined}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 22,
    paddingBottom: 14,
    paddingTop: 4,
  },
  resumeWrap: {
    paddingHorizontal: 22,
    paddingBottom: 14,
  },
  gridRow: {
    gap: 12,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  gridCell: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
});
