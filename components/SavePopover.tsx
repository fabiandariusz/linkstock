import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../hooks/ThemeContext';
import { createStore } from '../store/store';
import { asyncStorageAdapter } from '../store/asyncStorageAdapter';
import type { Collection } from '../store/store';

const COLLECTIONS_KEY = 'linkstock:collections';
const store = createStore(asyncStorageAdapter);

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function SavePopover({ visible, onClose, onSaved }: Props) {
  const { colors } = useTheme();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (!visible) return;
    setUrl('');
    setTitle('');
    setTags('');
    setCollectionId(null);
    AsyncStorage.getItem(COLLECTIONS_KEY).then(raw => {
      setCollections(raw ? JSON.parse(raw) : []);
    });
  }, [visible]);

  async function handleSave() {
    if (!url.trim()) return;
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    await store.saveItem(url.trim(), { title: title.trim(), collectionId, tags: tagList });
    onSaved();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <TextInput
            placeholder="Paste a URL…"
            placeholderTextColor={colors.muted}
            value={url}
            onChangeText={setUrl}
            autoFocus
            style={[styles.input, { color: colors.ink, borderColor: colors.rule }]}
          />
          <TextInput
            placeholder="Title"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { color: colors.ink, borderColor: colors.rule }]}
          />
          <TextInput
            placeholder="Tags (comma-separated)"
            placeholderTextColor={colors.muted}
            value={tags}
            onChangeText={setTags}
            style={[styles.input, { color: colors.ink, borderColor: colors.rule }]}
          />
          {collections.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {collections.map(c => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCollectionId(collectionId === c.id ? null : c.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${c.emoji} ${c.name}`}
                  accessibilityState={{ selected: collectionId === c.id }}
                  style={[
                    styles.chip,
                    { borderColor: colors.rule, backgroundColor: collectionId === c.id ? colors.accentSoft : colors.card2 },
                  ]}
                >
                  <Text style={{ color: colors.ink, fontSize: 13 }}>{c.emoji} {c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <View style={styles.row}>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              style={[styles.cancelBtn, { borderColor: colors.rule }]}
            >
              <Text style={{ color: colors.ink2, fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel="Save"
              style={[styles.saveBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={{ color: colors.card2, fontWeight: '600', fontSize: 15 }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet:    { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, gap: 12 },
  input:    { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  chipRow:  { flexDirection: 'row' },
  chip:     { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  row:       { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  saveBtn:   { flex: 2, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
});
