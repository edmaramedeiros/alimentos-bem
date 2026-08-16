import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

/**
 * expo-secure-store não tem suporte no web, por isso caímos para localStorage
 * nessa plataforma. No Android/iOS, o token fica no keystore/keychain do SO.
 */
const secureStorage: StateStorage = {
  getItem: async (name) => {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(name) ?? null;
    }
    return (await SecureStore.getItemAsync(name)) ?? null;
  },
  setItem: async (name, value) => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(name, value);
      return;
    }
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(name);
      return;
    }
    await SecureStore.deleteItemAsync(name);
  },
};

export default secureStorage;
