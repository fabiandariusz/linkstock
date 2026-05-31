import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../hooks/ThemeContext';
import { createStore } from '../store/store';
import { asyncStorageAdapter } from '../store/asyncStorageAdapter';
import type { Collection } from '../store/store';

const COLLECTIONS_KEY = 'linkstock:collections';
const store = createStore(asyncStorageAdapter);

export interface SavePayload {
  url: string;
  title: string;
  tags: string[];
  collectionId: string | null;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialUrl?: string;
  initialTitle?: string;
  inline?: boolean;
  onSave?: (payload: SavePayload) => Promise<void>;
}

export function SavePopover({ visible, onClose, onSaved, initialUrl = '', initialTitle = '', inline = false, onSave }: Props) {
  const { colors } = useTheme();
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState(initialTitle);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [tagPills, setTagPills] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [phase, setPhase] = useState<'form' | 'confirm'>('form');

  useEffect(() => {
    if (!visible) return;
    setUrl(initialUrl);
    setTitle(initialTitle);
    setTagPills([]);
    setTagInput('');
    setCollectionId(null);
    setPhase('form');
    AsyncStorage.getItem(COLLECTIONS_KEY).then(raw => {
      setCollections(raw ? JSON.parse(raw) : []);
    });
  }, [visible]);

  async function handleSave() {
    if (!url.trim()) return;
    const payload: SavePayload = {
      url: url.trim(),
      title: title.trim(),
      tags: tagPills,
      collectionId,
    };
    if (onSave) {
      await onSave(payload);
    } else {
      await store.saveItem(payload.url, {
        title: payload.title,
        collectionId: payload.collectionId,
        tags: payload.tags,
      });
    }
    setPhase('confirm');
    setTimeout(onSaved, 1100);
  }

  const body = (
    <View style={inline ? styles.inlineRoot : styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          {phase === 'confirm' ? (
            <View style={styles.confirmView}>
              <Text style={{ fontSize: 32 }}>✓</Text>
              <Text style={{ color: colors.ink, fontSize: 20, fontWeight: '600' }}>Saved!</Text>
              <Text style={{ color: colors.ink2, fontSize: 14, fontStyle: 'italic' }}>Open the app whenever you're ready.</Text>
            </View>
          ) : null}
          {phase === 'form' && <>
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
          <View style={[styles.tagRow, { borderColor: colors.rule }]}>
            {tagPills.map(tag => (
              <View key={tag} style={[styles.tagPill, { backgroundColor: colors.accentSoft }]}>
                <Text style={{ color: colors.ink, fontSize: 13 }}>{tag}</Text>
                <TouchableOpacity
                  onPress={() => setTagPills(tagPills.filter(t => t !== tag))}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${tag}`}
                >
                  <Text style={{ color: colors.ink2, fontSize: 13, marginLeft: 4 }}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              placeholder="Add tag…"
              placeholderTextColor={colors.muted}
              value={tagInput}
              onChangeText={(text) => {
                if (text.includes(',')) {
                  const t = text.replace(',', '').trim();
                  if (t) setTagPills([...tagPills, t]);
                  setTagInput('');
                } else {
                  setTagInput(text);
                }
              }}
              onSubmitEditing={() => {
                const t = tagInput.trim();
                if (t) { setTagPills([...tagPills, t]); setTagInput(''); }
              }}
              style={{ color: colors.ink, fontSize: 14, minWidth: 80, flexShrink: 1 }}
            />
          </View>
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
          </>}
        </View>
      </View>
  );

  if (inline) return body;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {body}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  inlineRoot: { flex: 1 },
  sheet:    { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, gap: 12 },
  input:    { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  chipRow:  { flexDirection: 'row' },
  tagRow:   { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, gap: 6, alignItems: 'center' },
  tagPill:  { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  chip:     { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  row:       { flexDirection: 'row', gap: 10, marginTop: 4 },
  confirmView: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  saveBtn:   { flex: 2, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
});
