import React from 'react';
import { close } from 'expo-share-extension';
import { ThemeProvider } from '../hooks/ThemeContext';
import { ShareExtensionRoot } from './ShareExtensionRoot';

interface Props {
  url?: string;
  preprocessingResults?: { title?: string };
}

export default function ShareExtension({ url, preprocessingResults }: Props) {
  return (
    <ThemeProvider>
      <ShareExtensionRoot
        initialUrl={url ?? ''}
        initialTitle={preprocessingResults?.title ?? ''}
        completeRequest={() => close()}
      />
    </ThemeProvider>
  );
}
