import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './hooks/ThemeContext';
import { AppFontLoader } from './hooks/AppFontLoader';
import { BottomNav } from './components/BottomNav';
import { StacksScreen }   from './screens/StacksScreen';
import { ShelvesScreen }  from './screens/ShelvesScreen';
import { SearchScreen }   from './screens/SearchScreen';
import { SettingsScreen } from './screens/SettingsScreen';

type TabId = 'inbox' | 'shelves' | 'search' | 'settings';

function Shell() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<TabId>('inbox');

  const screen =
    tab === 'inbox'    ? <StacksScreen />   :
    tab === 'shelves'  ? <ShelvesScreen />  :
    tab === 'search'   ? <SearchScreen />   :
                         <SettingsScreen />;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.paper }]}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {screen}
      </View>
      <BottomNav tab={tab} onTabChange={setTab} onAdd={() => {}} />
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
