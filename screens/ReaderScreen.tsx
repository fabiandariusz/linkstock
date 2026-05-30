import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';

type Props = {
  itemId: string;
  onBack: () => void;
};

export function ReaderScreen({ itemId, onBack }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.paper }]}>
      <TouchableOpacity onPress={onBack} style={styles.back}>
        <Text style={[styles.backText, { color: colors.accent }]}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.label, { color: colors.muted }]}>
        Reader — coming in a later slice
      </Text>
      <Text style={[styles.id, { color: colors.ink2 }]}>{itemId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  back:     { position: 'absolute', top: 56, left: 22 },
  backText: { fontFamily: 'DM Sans', fontSize: 15 },
  label:    { fontFamily: 'DM Sans', fontSize: 14 },
  id:       { fontFamily: 'DM Mono', fontSize: 11 },
});
