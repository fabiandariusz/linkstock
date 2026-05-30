import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageAdapter } from './store';

export const asyncStorageAdapter: StorageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
};
