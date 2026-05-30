import React, { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './hooks/ThemeContext';
import { AppFontLoader } from './hooks/AppFontLoader';
import { BottomNav } from './components/BottomNav';
import { StacksScreen }   from './screens/StacksScreen';
import { ReaderScreen }   from './screens/ReaderScreen';
import { ShelvesScreen }  from './screens/ShelvesScreen';
import { SearchScreen }   from './screens/SearchScreen';
import { SettingsScreen } from './screens/SettingsScreen';

type TabId = 'inbox' | 'shelves' | 'search' | 'settings';

function Shell() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<TabId>('inbox');
  const [readerId, setReaderId] = useState<string | null>(null);

  const handleAdd = () => {
    Alert.alert('Save a link', 'Paste your URL here — full Save Popover coming in a later slice.');
  };

  const screen = readerId != null
    ? <ReaderScreen itemId={readerId} onBack={() => setReaderId(null)} />
    : tab === 'inbox'    ? <StacksScreen onOpenItem={(id) => setReaderId(id)} />
    : tab === 'shelves'  ? <ShelvesScreen />
    : tab === 'search'   ? <SearchScreen />
    : <SettingsScreen />;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.paper }]}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {screen}
      </View>
      <BottomNav tab={tab} onTabChange={(t) => { setReaderId(null); setTab(t); }} onAdd={handleAdd} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppFontLoader fallback={null}>
          <Shell />
        </AppFontLoader>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  content: { flex: 1 },
});
