import React from 'react';
import { useFonts } from 'expo-font';

type Props = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};

export function AppFontLoader({ children, fallback }: Props) {
  const [loaded] = useFonts({
    // Reading fonts
    'Newsreader_400Regular':  require('../assets/fonts/Newsreader_400Regular.ttf'),
    'Newsreader_500Medium':   require('../assets/fonts/Newsreader_500Medium.ttf'),
    'Lora_400Regular':        require('../assets/fonts/Lora_400Regular.ttf'),
    'Lora_500Medium':         require('../assets/fonts/Lora_500Medium.ttf'),
    'CrimsonPro_400Regular':  require('../assets/fonts/CrimsonPro_400Regular.ttf'),
    'CrimsonPro_500Medium':   require('../assets/fonts/CrimsonPro_500Medium.ttf'),
    'EBGaramond_400Regular':  require('../assets/fonts/EBGaramond_400Regular.ttf'),
    'EBGaramond_500Medium':   require('../assets/fonts/EBGaramond_500Medium.ttf'),
    // UI font
    'DMSans_400Regular':      require('../assets/fonts/DMSans_400Regular.ttf'),
    'DMSans_500Medium':       require('../assets/fonts/DMSans_500Medium.ttf'),
    'DMSans_600SemiBold':     require('../assets/fonts/DMSans_600SemiBold.ttf'),
    // Mono font
    'DMMono_400Regular':      require('../assets/fonts/DMMono_400Regular.ttf'),
    'DMMono_500Medium':       require('../assets/fonts/DMMono_500Medium.ttf'),
  });

  if (!loaded) return <>{fallback}</>;
  return <>{children}</>;
}
