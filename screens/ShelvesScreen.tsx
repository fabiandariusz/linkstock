import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../hooks/ThemeContext';
import { PageHeader } from '../components/PageHeader';
import { SectionLabel } from '../components/SectionLabel';
import { Pill } from '../components/Pill';
import { IconBtn } from '../components/IconBtn';
import { IcAdd, IcFilter } from '../components/icons';
import { createStore } from '../store/store';
import { asyncStorageAdapter } from '../store/asyncStorageAdapter';
import type { Collection, Item } from '../store/store';

const store = createStore(asyncStorageAdapter);

const ITEMS_KEY = 'linkstock:items';

function isWeekend(isoString: string): boolean {
  const day = new Date(isoString).getDay();
  return day === 0 || day === 6;
}

type Props = {
  onOpenCollection?: (collectionId: string) => void;
};

export function ShelvesScreen({ onOpenCollection }: Props) {
  const { colors, fonts } = useTheme();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    async function load() {
      const [cols, raw] = await Promise.all([
        store.getCollections(),
        AsyncStorage.getItem(ITEMS_KEY),
      ]);
      setCollections(cols);
      setItems(raw ? JSON.parse(raw) : []);
    }
    load();
  }, []);

  const handleAddCollection = useCallback(async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const created = await store.saveCollection(trimmed);
    setCollections(prev => [...prev, created]);
    setNewName('');
    setShowAddSheet(false);
  }, [newName]);

  const handleOpenCollection = useCallback((id: string) => {
    onOpenCollection?.(id);
  }, [onOpenCollection]);

  // derived
  const allTags = Array.from(new Set(items.flatMap(i => i.tags)));
  const tagCount = (tag: string) => items.filter(i => i.tags.includes(tag)).length;
  const collectionCount = (id: string) => items.filter(i => i.collectionId === id).length;

  const smartShelves = [
    {
      name: 'Saved on weekends',
      sub: 'Articles + videos saved Saturday or Sunday',
      count: items.filter(i => isWeekend(i.savedAt)).length,
    },
    {
      name: 'Over 15 minutes',
      sub: 'Long-form, for trains and Sunday mornings',
      count: items.filter(i => i.minutes > 15).length,
    },
    {
      name: 'From newsletters',
      sub: 'Anything tagged "newsletter"',
      count: items.filter(i => i.tags.includes('newsletter')).length,
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.paper }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeader
          eyebrow={`Shelves · ${collections.length} collection${collections.length !== 1 ? 's' : ''}`}
          title="Where it lives."
          sub="Group by collection. Filter by tag. Everything you save lands in one — even if it's the inbox."
          right={
            <IconBtn
              accessibilityLabel="Add collection"
              onPress={() => setShowAddSheet(true)}
            >
              <IcAdd size={18} color={colors.ink2} />
            </IconBtn>
          }
        />

        {/* Collections */}
        <SectionLabel>Collections</SectionLabel>
        {collections.length === 0 ? (
          <Text style={[styles.empty, { color: colors.muted }]}>
            No collections yet — tap + to create one.
          </Text>
        ) : (
          <View style={styles.grid}>
            {collections.map(c => {
              const count = collectionCount(c.id);
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.collectionCard, { backgroundColor: colors.card, borderColor: colors.rule }]}
                  onPress={() => handleOpenCollection(c.id)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.badge, { backgroundColor: `hsl(${c.hue}, 45%, 58%)` }]}>
                    <Text style={styles.badgeEmoji}>{c.emoji}</Text>
                  </View>
                  <Text style={[styles.cardName, { color: colors.ink }]}>{c.name}</Text>
                  <Text style={[styles.cardCount, { color: colors.muted, fontFamily: fonts.mono }]}>
                    {count} {count === 1 ? 'item' : 'items'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Tags */}
        <SectionLabel>Tags</SectionLabel>
        <View style={styles.tagCloud}>
          {allTags.map(tag => (
            <Pill key={tag}>
              {`#${tag}  ${tagCount(tag)}`}
            </Pill>
          ))}
          {allTags.length === 0 && (
            <Text style={[styles.empty, { color: colors.muted }]}>No tags yet.</Text>
          )}
        </View>

        {/* Smart shelves */}
        <SectionLabel>Smart shelves</SectionLabel>
        <View style={styles.smartShelves}>
          {smartShelves.map((s, i) => (
            <View
              key={s.name}
              style={[
                styles.shelfRow,
                i < smartShelves.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.rule },
              ]}
            >
              <View style={[styles.shelfIcon, { borderColor: colors.rule }]}>
                <IcFilter size={16} color={colors.muted} />
              </View>
              <View style={styles.shelfText}>
                <Text style={[styles.shelfName, { color: colors.ink }]}>{s.name}</Text>
                <Text style={[styles.shelfSub, { color: colors.muted }]}>{s.sub}</Text>
              </View>
              <Text style={[styles.shelfCount, { color: colors.muted, fontFamily: fonts.mono }]}>
                {s.count}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add collection modal */}
      <Modal
        visible={showAddSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddSheet(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddSheet(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
            <Text style={[styles.sheetTitle, { color: colors.ink }]}>New collection</Text>
            <TextInput
              style={[styles.sheetInput, { color: colors.ink, borderColor: colors.rule, backgroundColor: colors.paper }]}
              placeholder="Collection name"
              placeholderTextColor={colors.muted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.sheetButtons}>
              <TouchableOpacity style={styles.sheetCancel} onPress={() => setShowAddSheet(false)}>
                <Text style={{ color: colors.muted }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetConfirm, { backgroundColor: colors.accent }]}
                onPress={handleAddCollection}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 120 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 18,
    gap: 10,
  },
  collectionCard: {
    width: '47%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: { fontSize: 15 },
  cardName: {
    marginTop: 12,
    fontFamily: 'Newsreader',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  cardCount: {
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 0.04,
  },
  empty: {
    paddingHorizontal: 22,
    paddingBottom: 14,
    fontSize: 14,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 22,
    paddingBottom: 16,
    gap: 6,
  },
  smartShelves: {
    paddingHorizontal: 22,
  },
  shelfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  shelfIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shelfText: { flex: 1, minWidth: 0 },
  shelfName: { fontFamily: 'DM Sans', fontWeight: '500', fontSize: 15 },
  shelfSub: { fontSize: 12, marginTop: 2, fontFamily: 'DM Sans' },
  shelfCount: { fontSize: 12 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontFamily: 'Newsreader',
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 16,
  },
  sheetInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'DM Sans',
    marginBottom: 20,
  },
  sheetButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  sheetCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sheetConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});
