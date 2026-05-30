import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../hooks/ThemeContext';
import { createStore } from '../store/store';
import { asyncStorageAdapter } from '../store/asyncStorageAdapter';
import type { Item } from '../store/store';
import {
  IcBack, IcSpeaker, IcAa, IcHighlight, IcNote, IcStar, IcShare, IcArchive, IcLink,
} from '../components/icons';

type Props = {
  itemId: string;
  onBack: () => void;
};

type ReaderThemeName = 'paper' | 'sepia' | 'night';

const READER_THEMES = {
  paper: { bg: '#f3ead5', surface: '#faf2dc', ink: '#2a2218', muted: '#8e7e68', rule: '#d6c6a3', hl: 'rgba(217,170,92,0.45)' },
  sepia: { bg: '#ebd9b0', surface: '#f1e2bc', ink: '#3a2a14', muted: '#8a6f3f', rule: '#c9b482', hl: 'rgba(193,123,55,0.42)' },
  night: { bg: '#1a1610', surface: '#231d14', ink: '#ece2c9', muted: '#9d8a6a', rule: '#3d3324', hl: 'rgba(217,170,92,0.30)' },
};

const FONT_OPTIONS = [
  { label: 'News', name: 'Newsreader', regular: 'Newsreader_400Regular', medium: 'Newsreader_500Medium' },
  { label: 'Lora', name: 'Lora', regular: 'Lora_400Regular', medium: 'Lora_500Medium' },
  { label: 'Crimson', name: 'Crimson Pro', regular: 'CrimsonPro_400Regular', medium: 'CrimsonPro_500Medium' },
  { label: 'Garamond', name: 'EB Garamond', regular: 'EBGaramond_400Regular', medium: 'EBGaramond_500Medium' },
];

type Para = { text: string; big?: boolean; note?: string };

const THEME_KEY = 'linkstock:readerTheme';
const SIZE_KEY = 'linkstock:fontSize';

function getArticleBody(item: Item): Para[] {
  const paras: Para[] = [
    { text: item.excerpt },
    { text: 'There is a particular quality to the work that emerges from patience. Not the patience of waiting, but the patience of returning — of finding the same question on successive mornings and sitting with it a little longer each time.' },
    { text: 'The most honest thing we can do is admit that we are slow. That understanding takes time. That changing one\'s mind is a process, not an event.', big: true },
    { text: 'Most of us were never taught this. We were taught to have opinions quickly, to hold them firmly, and to defend them as though they were territory rather than hypotheses.' },
    { text: 'I have found that the things worth keeping — the ideas that stay, the questions that expand, the books that improve with distance — are rarely the things that announced themselves loudly.' },
    { text: 'What changes, when you give it enough time, is not the subject but the quality of your attention. You begin to notice the gaps. The unspoken assumptions. The questions that have been avoided by both sides.' },
    { text: 'And that, perhaps, is the only honest end: not a conclusion, but a better question.' },
  ];
  const noteText = item.notes[3];
  if (noteText) paras[3] = { ...paras[3], note: noteText };
  return paras;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const store = createStore(asyncStorageAdapter);

export function ReaderScreen({ itemId, onBack }: Props) {
  const { colors } = useTheme();
  const [item, setItem] = useState<Item | null>(null);
  const [readerTheme, setReaderTheme] = useState<ReaderThemeName>('paper');
  const [fontSize, setFontSize] = useState(18);
  const [readingFont, setReadingFont] = useState(FONT_OPTIONS[0]);
  const [showControls, setShowControls] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [highlights, setHighlights] = useState<Set<number>>(new Set());

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<Record<number, number>>({});
  const scrollRef = useRef<ScrollView>(null);
  const contentHeightRef = useRef(0);
  const viewHeightRef = useRef(0);
  const didScrollInit = useRef(false);
  const savedProgressRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [items, savedTheme, savedSize] = await Promise.all([
        store.getItems(),
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(SIZE_KEY),
      ]);
      if (cancelled) return;
      const found = items.find(i => i.id === itemId) ?? null;
      setItem(found);
      if (found) {
        savedProgressRef.current = found.progress;
        setScrollPct(found.progress);
        setHighlights(new Set(found.highlights));
      }
      if (savedTheme && savedTheme in READER_THEMES) setReaderTheme(savedTheme as ReaderThemeName);
      if (savedSize) {
        const n = parseInt(savedSize, 10);
        if (!isNaN(n)) setFontSize(Math.min(26, Math.max(14, n)));
      }
    }
    load();
    return () => { cancelled = true; };
  }, [itemId]);

  function tryScrollToProgress() {
    if (didScrollInit.current) return;
    if (viewHeightRef.current === 0 || contentHeightRef.current === 0) return;
    const maxY = contentHeightRef.current - viewHeightRef.current;
    if (maxY <= 0) return;
    didScrollInit.current = true;
    scrollRef.current?.scrollTo({ y: maxY * savedProgressRef.current, animated: false });
  }

  const t = READER_THEMES[readerTheme];
  const minLeft = item ? Math.max(1, Math.round((1 - scrollPct) * item.minutes)) : 0;
  const pct = Math.round(scrollPct * 100);

  function handleScroll(e: {
    nativeEvent: {
      contentOffset: { y: number };
      contentSize: { height: number };
      layoutMeasurement: { height: number };
    };
  }) {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const maxY = contentSize.height - layoutMeasurement.height;
    const newPct = maxY <= 0 ? 0 : Math.min(1, contentOffset.y / maxY);
    setScrollPct(newPct);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (item) store.updateItem(item.id, { progress: newPct });
    }, 500);
  }

  async function handleTheme(name: ReaderThemeName) {
    setReaderTheme(name);
    await AsyncStorage.setItem(THEME_KEY, name);
  }

  function handleFontSize(delta: number) {
    setFontSize(s => {
      const next = Math.min(26, Math.max(14, s + delta));
      AsyncStorage.setItem(SIZE_KEY, String(next));
      return next;
    });
  }

  function handleTap(idx: number) {
    const now = Date.now();
    const last = lastTapRef.current[idx] ?? 0;
    if (now - last < 300) {
      setHighlights(prev => {
        const next = new Set(prev);
        if (next.has(idx)) next.delete(idx); else next.add(idx);
        if (item) store.updateItem(item.id, { highlights: [...next] });
        return next;
      });
    }
    lastTapRef.current[idx] = now;
  }

  if (!item) {
    return (
      <View style={[styles.loading, { backgroundColor: t.bg }]}>
        <Text style={{ color: t.muted, fontFamily: 'DMMono_400Regular', fontSize: 12 }}>
          Loading…
        </Text>
      </View>
    );
  }

  const paras = getArticleBody(item);

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { backgroundColor: t.bg, borderBottomColor: t.rule }]}>
        <View style={styles.topRow}>
          <TouchableOpacity
            testID="btn-back"
            onPress={onBack}
            style={[styles.iconBtn, { borderColor: t.rule }]}
          >
            <IcBack size={18} color={t.ink} />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <Text style={[styles.siteLabel, { color: t.muted }]} numberOfLines={1}>
              {item.site.toUpperCase()}
            </Text>
            <Text style={[styles.progressLabel, { color: t.muted }]}>
              {minLeft} min left · {pct}%
            </Text>
          </View>

          <View style={styles.topRight}>
            <TouchableOpacity
              testID="btn-speaker"
              onPress={() => setPlaying(p => !p)}
              style={[
                styles.iconBtn,
                playing
                  ? { backgroundColor: colors.accent, borderColor: colors.accent }
                  : { borderColor: t.rule },
              ]}
            >
              <IcSpeaker size={18} color={playing ? '#fbf2dc' : t.ink} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="btn-aa"
              onPress={() => setShowControls(s => !s)}
              style={[
                styles.iconBtn,
                showControls
                  ? { backgroundColor: colors.accent, borderColor: colors.accent }
                  : { borderColor: t.rule },
              ]}
            >
              <IcAa size={18} color={showControls ? '#fbf2dc' : t.ink} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress strand */}
        <View style={[styles.strandTrack, { backgroundColor: t.rule }]}>
          <View style={[styles.strandFill, { width: `${pct}%`, backgroundColor: colors.accent }]} />
        </View>
      </View>

      {/* Font controls panel */}
      {showControls && (
        <View style={[styles.controlPanel, { backgroundColor: t.surface, borderColor: t.rule }]}>
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: t.muted }]}>THEME</Text>
            <View style={styles.controlBody}>
              {(['paper', 'sepia', 'night'] as ReaderThemeName[]).map(name => {
                const th = READER_THEMES[name];
                const active = readerTheme === name;
                return (
                  <TouchableOpacity
                    key={name}
                    onPress={() => handleTheme(name)}
                    style={[
                      styles.themeChip,
                      {
                        backgroundColor: th.bg,
                        borderColor: active ? colors.accent : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[styles.themeChipLabel, { color: th.ink }]}>
                      {name === 'paper' ? 'Paper' : name === 'sepia' ? 'Sepia' : 'Night'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.controlRow, { marginTop: 12 }]}>
            <Text style={[styles.controlLabel, { color: t.muted }]}>SIZE</Text>
            <View style={styles.controlBody}>
              <TouchableOpacity onPress={() => handleFontSize(-1)} style={[styles.sizeBtn, { borderColor: t.rule }]}>
                <Text style={{ color: t.ink, fontFamily: readingFont.regular, fontSize: 14 }}>A</Text>
              </TouchableOpacity>
              <View style={[styles.sizeTrack, { backgroundColor: t.rule }]}>
                <View style={[styles.sizeFill, { width: `${((fontSize - 14) / 12) * 100}%`, backgroundColor: colors.accent }]} />
                <View style={[
                  styles.sizeThumb,
                  {
                    left: `${((fontSize - 14) / 12) * 100}%`,
                    backgroundColor: colors.accent,
                  },
                ]} />
              </View>
              <TouchableOpacity onPress={() => handleFontSize(1)} style={[styles.sizeBtn, { borderColor: t.rule }]}>
                <Text style={{ color: t.ink, fontFamily: readingFont.medium, fontSize: 22 }}>A</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.controlRow, { marginTop: 12 }]}>
            <Text style={[styles.controlLabel, { color: t.muted }]}>FONT</Text>
            <View style={[styles.controlBody, { flexWrap: 'wrap', gap: 6 }]}>
              {FONT_OPTIONS.map(f => {
                const active = readingFont.name === f.name;
                return (
                  <TouchableOpacity
                    key={f.name}
                    onPress={() => setReadingFont(f)}
                    style={[
                      styles.fontChip,
                      {
                        borderColor: active ? colors.accent : t.rule,
                        backgroundColor: active ? colors.accent : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[
                      styles.fontChipLabel,
                      { color: active ? '#fbf2dc' : t.muted, fontFamily: f.regular },
                    ]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Article body */}
      <ScrollView
        ref={scrollRef}
        testID="reader-scroll"
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={(_w, h) => {
          contentHeightRef.current = h;
          tryScrollToProgress();
        }}
        onLayout={e => {
          viewHeightRef.current = e.nativeEvent.layout.height;
          tryScrollToProgress();
        }}
      >
        <Text style={[styles.byline, { color: t.muted }]}>
          {item.site.toUpperCase()} · {formatDate(item.savedAt)} · {item.minutes} MIN
        </Text>

        <Text style={[styles.title, { color: t.ink, fontFamily: readingFont.medium }]}>
          {item.title}
        </Text>

        <Text style={[styles.subtitle, { color: t.muted, fontFamily: readingFont.regular }]} numberOfLines={2}>
          {item.excerpt}
        </Text>

        <View style={[styles.authorRow, { borderTopColor: t.rule, borderBottomColor: t.rule }]}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitials}>{initials(item.author)}</Text>
          </View>
          <View>
            <Text style={[styles.authorName, { color: t.ink }]}>{item.author}</Text>
            <Text style={[styles.authorTagline, { color: t.muted }]}>writing on the open web</Text>
          </View>
        </View>

        {paras.map((p, i) => (
          <ParaBlock
            key={i}
            p={p}
            fontSize={fontSize}
            readingFont={readingFont}
            t={t}
            highlighted={highlights.has(i)}
            onTap={() => handleTap(i)}
            accentColor={colors.accent}
          />
        ))}

        <View style={[styles.footer, { borderTopColor: t.rule }]}>
          <IcLink size={14} color={t.muted} />
          <Text style={[styles.footerUrl, { color: t.muted }]} numberOfLines={1}>
            {item.url}
          </Text>
        </View>
      </ScrollView>

      {/* TTS bar */}
      {playing && (
        <View style={[styles.ttsBar, { backgroundColor: colors.accent }]}>
          <View style={styles.ttsPauseBtn}>
            <View style={styles.ttsPauseRect} />
            <View style={[styles.ttsPauseRect, { marginLeft: 4 }]} />
          </View>
          <View style={styles.ttsCenter}>
            <Text style={styles.ttsListeningLabel}>LISTENING</Text>
            <Text style={styles.ttsTitleLabel} numberOfLines={1}>
              {item.title} · 1.0×
            </Text>
          </View>
          <TouchableOpacity testID="btn-stop" onPress={() => setPlaying(false)} style={styles.ttsStopBtn}>
            <Text style={styles.ttsStopLabel}>STOP</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating action bar */}
      <View style={[styles.actionBar, { backgroundColor: t.surface, borderColor: t.rule }]}>
        {([IcHighlight, IcNote, IcStar, IcShare, IcArchive] as React.ComponentType<{ size: number; color: string }>[]).map((Icon, i) => (
          <TouchableOpacity key={i} style={styles.actionBtn}>
            <Icon size={18} color={t.ink} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

type ParaBlockProps = {
  p: Para;
  fontSize: number;
  readingFont: (typeof FONT_OPTIONS)[0];
  t: (typeof READER_THEMES)['paper'];
  highlighted: boolean;
  onTap: () => void;
  accentColor: string;
};

function ParaBlock({ p, fontSize, readingFont, t, highlighted, onTap, accentColor }: ParaBlockProps) {
  const bigSize = Math.round(fontSize * 1.3);
  const bigLineHeight = Math.round(bigSize * 1.25);
  const normalLineHeight = Math.round(fontSize * 1.6);

  return (
    <View>
      <Pressable onPress={onTap}>
        {p.big ? (
          <View style={[
            styles.pullQuote,
            {
              borderLeftColor: accentColor,
              backgroundColor: highlighted ? t.hl : 'transparent',
              borderRadius: highlighted ? 3 : 0,
            },
          ]}>
            <Text style={{
              fontFamily: readingFont.medium,
              fontSize: bigSize,
              lineHeight: bigLineHeight,
              fontStyle: 'italic',
              color: t.ink,
              letterSpacing: -0.05,
            }}>{p.text}</Text>
          </View>
        ) : (
          <View style={[
            styles.normalParaWrap,
            highlighted ? { backgroundColor: t.hl, borderRadius: 3 } : undefined,
          ]}>
            <Text style={{
              fontFamily: readingFont.regular,
              fontSize,
              lineHeight: normalLineHeight,
              color: t.ink,
              letterSpacing: -0.05,
            }}>{p.text}</Text>
          </View>
        )}
      </Pressable>
      {p.note != null && (
        <View style={[styles.noteAside, { borderLeftColor: accentColor }]}>
          <IcNote size={14} color={t.ink} sw={1.5} />
          <Text style={[styles.noteText, { color: t.ink, fontFamily: readingFont.regular }]}>
            "{p.note}"
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Top bar
  topBar: {
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
  },
  topRight: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  siteLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  progressLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11.5,
    marginTop: 2,
  },
  strandTrack: {
    height: 2,
  },
  strandFill: {
    height: 2,
  },

  // Controls panel
  controlPanel: {
    margin: 10,
    padding: 14,
    borderWidth: 1,
    borderRadius: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  controlLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.6,
    width: 44,
  },
  controlBody: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  themeChip: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeChipLabel: {
    fontFamily: 'Newsreader_500Medium',
    fontSize: 13,
    fontWeight: '500',
  },
  sizeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeTrack: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    position: 'relative',
    marginHorizontal: 4,
  },
  sizeFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    borderRadius: 999,
  },
  sizeThumb: {
    position: 'absolute',
    top: '50%',
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: -7,
    marginLeft: -7,
  },
  fontChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  fontChipLabel: {
    fontSize: 12,
  },

  // Article scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 180,
  },
  byline: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10.5,
    letterSpacing: 1.8,
    marginBottom: 14,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '500',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 17,
    fontStyle: 'italic',
    marginBottom: 24,
    lineHeight: 24,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  authorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#d9aa5c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitials: {
    fontFamily: 'Newsreader_500Medium',
    fontSize: 13,
    color: '#fff5e1',
    fontWeight: '600',
  },
  authorName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
  },
  authorTagline: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11.5,
  },

  // Paragraphs
  normalParaWrap: {
    marginBottom: 18,
  },
  pullQuote: {
    borderLeftWidth: 3,
    paddingLeft: 16,
    marginVertical: 28,
  },
  noteAside: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginTop: -8,
    marginBottom: 22,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 12,
    backgroundColor: 'rgba(217,170,92,0.12)',
    borderLeftWidth: 2,
    borderRadius: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13.5,
    fontStyle: 'italic',
    lineHeight: 19,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    marginTop: 20,
  },
  footerUrl: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    letterSpacing: 1.4,
    flex: 1,
  },

  // TTS bar
  ttsBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 84,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ttsPauseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ttsPauseRect: {
    width: 3,
    height: 12,
    backgroundColor: '#fbf2dc',
    borderRadius: 1,
  },
  ttsCenter: {
    flex: 1,
    minWidth: 0,
  },
  ttsListeningLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    letterSpacing: 1.4,
    color: 'rgba(251,242,220,0.7)',
  },
  ttsTitleLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#fbf2dc',
  },
  ttsStopBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ttsStopLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: '#fbf2dc',
  },

  // Floating action bar
  actionBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 26,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
