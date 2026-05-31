import React from 'react';
import { useFonts } from 'expo-font';
import { Newsreader_400Regular, Newsreader_500Medium } from '@expo-google-fonts/newsreader';
import { Lora_400Regular, Lora_500Medium } from '@expo-google-fonts/lora';
import { CrimsonPro_400Regular, CrimsonPro_500Medium } from '@expo-google-fonts/crimson-pro';
import { EBGaramond_400Regular, EBGaramond_500Medium } from '@expo-google-fonts/eb-garamond';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';

type Props = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};

export function AppFontLoader({ children, fallback }: Props) {
  const [loaded] = useFonts({
    Newsreader_400Regular,
    Newsreader_500Medium,
    Lora_400Regular,
    Lora_500Medium,
    CrimsonPro_400Regular,
    CrimsonPro_500Medium,
    EBGaramond_400Regular,
    EBGaramond_500Medium,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMMono_400Regular,
    DMMono_500Medium,
  });

  if (!loaded) return <>{fallback}</>;
  return <>{children}</>;
}
