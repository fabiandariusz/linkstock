import React from 'react';
import { SavePopover, SavePayload } from '../components/SavePopover';
import { appendOutbox } from '../store/outbox';

interface Props {
  initialUrl: string;
  initialTitle: string;
  completeRequest: (reason: 'saved' | 'cancelled') => void;
}

export function ShareExtensionRoot({ initialUrl, initialTitle, completeRequest }: Props) {
  const onSave = async (payload: SavePayload) => {
    await appendOutbox({
      url: payload.url,
      title: payload.title,
      tags: payload.tags,
      collectionId: payload.collectionId,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <SavePopover
      visible={true}
      inline={true}
      initialUrl={initialUrl}
      initialTitle={initialTitle}
      onSave={onSave}
      onClose={() => completeRequest('cancelled')}
      onSaved={() => completeRequest('saved')}
    />
  );
}
