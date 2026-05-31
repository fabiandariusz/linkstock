import { NativeModules } from 'react-native';

export interface OutboxEntry {
  url: string;
  title: string;
  tags: string[];
  collectionId: string | null;
  createdAt: string;
}

interface OutboxNativeModule {
  append(jsonString: string): Promise<void>;
  drain(): Promise<unknown[]>;
}

function getNativeModule(): OutboxNativeModule | null {
  const mod = (NativeModules as Record<string, unknown>).Outbox;
  return (mod as OutboxNativeModule) ?? null;
}

export async function appendOutbox(entry: OutboxEntry): Promise<void> {
  const mod = getNativeModule();
  if (!mod) return;
  await mod.append(JSON.stringify(entry));
}

export async function drainOutbox(): Promise<OutboxEntry[]> {
  const mod = getNativeModule();
  if (!mod) return [];
  const raw = await mod.drain();
  if (!Array.isArray(raw)) return [];
  return raw.filter((e): e is OutboxEntry =>
    !!e && typeof e === 'object' && typeof (e as OutboxEntry).url === 'string'
  );
}
