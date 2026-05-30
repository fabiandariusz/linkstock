import React from 'react';
import { SavePopover } from '../components/SavePopover';

interface Props {
  initialUrl: string;
  initialTitle: string;
  completeRequest: (reason: 'saved' | 'cancelled') => void;
}

export function ShareExtensionRoot({ initialUrl, initialTitle, completeRequest }: Props) {
  return (
    <SavePopover
      visible={true}
      initialUrl={initialUrl}
      initialTitle={initialTitle}
      onClose={() => completeRequest('cancelled')}
      onSaved={() => completeRequest('saved')}
    />
  );
}
