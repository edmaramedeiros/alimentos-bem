import type { DocumentPickerAsset } from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

/** Lê um arquivo escolhido pelo document picker como base64 puro (sem o prefixo data:...;base64,). */
export async function readAssetAsBase64(asset: DocumentPickerAsset): Promise<string> {
  if (Platform.OS === 'web') {
    if (!asset.base64) {
      throw new Error('Não foi possível ler o arquivo selecionado');
    }
    const commaIndex = asset.base64.indexOf(',');
    return commaIndex >= 0 ? asset.base64.slice(commaIndex + 1) : asset.base64;
  }
  return FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
}
