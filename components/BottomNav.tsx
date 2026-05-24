import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';

type TabId = 'inbox' | 'shelves' | 'search' | 'settings';

const TABS: { id: TabId; label: string }[] = [
  { id: 'inbox',    label: 'Stacks'   },
  { id: 'shelves',  label: 'Shelves'  },
  { id: 'search',   label: 'Search'   },
  { id: 'settings', label: 'Settings' },
];

type Props = {
  tab: TabId;
  onTabChange: (id: TabId) => void;
  onAdd: () => void;
};

export function BottomNav({ tab, onTabChange, onAdd }: Props) {
  const { colors } = useTheme();
  const leftTabs  = TABS.slice(0, 2);
  const rightTabs = TABS.slice(2);

  return (
    <View style={[styles.container, { backgroundColor: colors.card2, borderColor: colors.ruleSoft }]}>
      {leftTabs.map(t => (
        <NavTab key={t.id} label={t.label} active={tab === t.id} onPress={() => onTabChange(t.id)} colors={colors} />
      ))}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Add item"
        onPress={onAdd}
        style={[styles.addBtn, { backgroundColor: colors.accent }]}
      />

      {rightTabs.map(t => (
        <NavTab key={t.id} label={t.label} active={tab === t.id} onPress={() => onTabChange(t.id)} colors={colors} />
      ))}
    </View>
  );
}

function NavTab({ label, active, onPress, colors }: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tab}>
      <Text style={{ color: active ? colors.accent : colors.muted, fontFamily: 'DM Sans', fontSize: 10.5 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 999,
  },
});
