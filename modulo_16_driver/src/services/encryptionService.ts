import * as FileSystem from 'expo-file-system';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'zenda-doc-encryption-key-2026';
const SALT = 'zenda-salt-2026';

export class EncryptionService {
  
  // Cifrar datos con AES-256
  static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY, {
      salt: SALT,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  }

  // Descifrar datos
  static decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY, {
      salt: SALT,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Cifrar un archivo y guardarlo
  static async encryptFile(fileUri: string): Promise<string> {
    try {
      const content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const encrypted = this.encrypt(content);
      
      const encryptedPath = `${FileSystem.documentDirectory}encrypted_${Date.now()}.enc`;
      await FileSystem.writeAsStringAsync(encryptedPath, encrypted, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      return encryptedPath;
    } catch (error) {
      console.error('Error cifrando archivo:', error);
      throw error;
    }
  }

  // Descifrar un archivo
  static async decryptFile(encryptedPath: string): Promise<string> {
    try {
      const encryptedContent = await FileSystem.readAsStringAsync(encryptedPath, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      const decrypted = this.decrypt(encryptedContent);
      
      const decryptedPath = `${FileSystem.documentDirectory}decrypted_${Date.now()}.tmp`;
      await FileSystem.writeAsStringAsync(decryptedPath, decrypted, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return decryptedPath;
    } catch (error) {
      console.error('Error descifrando archivo:', error);
      throw error;
    }
  }

  // Generar hash de verificación
  static generateHash(data: string): string {
    return CryptoJS.SHA256(data + SALT).toString();
  }

  // Verificar integridad de un documento
  static async verifyDocument(fileUri: string, expectedHash: string): Promise<boolean> {
    try {
      const content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const hash = this.generateHash(content);
      return hash === expectedHash;
    } catch (error) {
      return false;
    }
  }
}

export default EncryptionService;
