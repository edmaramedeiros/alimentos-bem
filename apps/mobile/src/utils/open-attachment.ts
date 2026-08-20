import * as FileSystem from 'expo-file-system/legacy';
import { Linking, Platform } from 'react-native';

/**
 * No web, precisa ser chamada de forma síncrona dentro do handler de clique (antes de
 * qualquer await); passado o tempo do gesto do usuário, window.open vira pop-up bloqueado.
 */
export function openAttachmentWindow(): Window | null {
  if (Platform.OS !== 'web') return null;
  return window.open('', '_blank');
}

function base64ToBlob(dataBase64: string, mimeType: string): Blob {
  const binary = atob(dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

/** Abre um anexo (base64 puro, sem prefixo) no visualizador do navegador/SO. */
export async function openAttachment(
  dataBase64: string,
  fileName: string,
  mimeType: string,
  targetWindow?: Window | null
): Promise<void> {
  if (Platform.OS === 'web') {
    // Chrome bloqueia navegar uma janela existente para uma data: URI ("not allowed to
    // navigate top frame to data URL"); blob: URL não tem essa restrição.
    const blobUrl = URL.createObjectURL(base64ToBlob(dataBase64, mimeType));
    if (targetWindow) {
      targetWindow.location.href = blobUrl;
    } else {
      window.open(blobUrl, '_blank');
    }
    return;
  }

  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, dataBase64, { encoding: FileSystem.EncodingType.Base64 });
  await Linking.openURL(fileUri);
}
