// WebCrypto helpers for encrypting/decrypting private keys and messages
// Implements the API shape provided by the user

export class CryptoUtils {
  static GCM_IV_LENGTH = 12;
  static GCM_TAG_LENGTH = 16;
  static AES_KEY_SIZE = 256;
  static PBKDF2_ITERATIONS = 65536;

  // UTILS
  static generateRandomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  static base64Encode(arrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  }

  static base64Decode(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // AES UTILS
  static AESUtils = class {
    static async deriveKeyFromPassword(password, salt) {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: CryptoUtils.PBKDF2_ITERATIONS,
          hash: 'SHA-256',
        },
        keyMaterial,
        {
          name: 'AES-GCM',
          length: CryptoUtils.AES_KEY_SIZE,
        },
        false,
        ['encrypt', 'decrypt']
      );
    }

    static async encrypt(plainText, key, iv) {
      const encoder = new TextEncoder();
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(plainText)
      );
      return CryptoUtils.base64Encode(encrypted);
    }

    static async decrypt(base64CipherText, key, iv) {
      const decoded = CryptoUtils.base64Decode(base64CipherText);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        decoded
      );
      return new TextDecoder().decode(decrypted);
    }

    static async decryptWithPassword(base64CipherText, password, salt, iv) {
      const key = await this.deriveKeyFromPassword(password, salt);
      return await this.decrypt(base64CipherText, key, iv);
    }

    static async encryptBytes(bytes, key, iv) {
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        bytes
      );
      return CryptoUtils.base64Encode(encrypted);
    }

    static async decryptBytes(base64Encrypted, key, iv) {
      const encryptedBytes = CryptoUtils.base64Decode(base64Encrypted);
      return await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedBytes
      );
    }
  };

  // RSA UTILS
  static RSAUtils = class {
    static async generateKeyPair() {
      return await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      );
    }

    static async encryptWithPublicKey(plainText, publicKey) {
      const encoder = new TextEncoder();
      const encrypted = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        encoder.encode(plainText)
      );
      return CryptoUtils.base64Encode(encrypted);
    }

    static async decryptWithPrivateKey(encryptedBase64, privateKey) {
      const encrypted = CryptoUtils.base64Decode(encryptedBase64);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encrypted
      );
      return new TextDecoder().decode(decrypted);
    }

    static async encodePublicKey(publicKey) {
      const exported = await crypto.subtle.exportKey('spki', publicKey);
      return CryptoUtils.base64Encode(exported);
    }

    static async decodePublicKey(base64) {
      const buffer = CryptoUtils.base64Decode(base64);
      return await crypto.subtle.importKey(
        'spki',
        buffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['encrypt']
      );
    }

    static async encodePrivateKey(privateKey) {
      const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
      return CryptoUtils.base64Encode(exported);
    }

    static async decodePrivateKey(base64) {
      const buffer = CryptoUtils.base64Decode(base64);
      return await crypto.subtle.importKey(
        'pkcs8',
        buffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['decrypt']
      );
    }
  };

  // PRIVATE KEY ENCRYPTION UTILS
  static PrivateKeyUtils = class {
    static decodeSalt(base64Salt) {
      return new Uint8Array(CryptoUtils.base64Decode(base64Salt));
    }

    static decodeIv(base64Iv) {
      return new Uint8Array(CryptoUtils.base64Decode(base64Iv));
    }

    static async encryptPrivateKey(privateKey, password, salt, iv) {
      const key = await CryptoUtils.AESUtils.deriveKeyFromPassword(password, salt);
      const pkcs8 = await crypto.subtle.exportKey('pkcs8', privateKey);
      return await CryptoUtils.AESUtils.encryptBytes(pkcs8, key, iv);
    }

    static async encryptPrivateKeyWithKey(privateKey, secretKey, iv) {
      const pkcs8 = await crypto.subtle.exportKey('pkcs8', privateKey);
      return await CryptoUtils.AESUtils.encryptBytes(pkcs8, secretKey, iv);
    }

    static async decryptPrivateKey(encryptedBase64, password, salt, iv) {
      const key = await CryptoUtils.AESUtils.deriveKeyFromPassword(password, salt);
      const decrypted = await CryptoUtils.AESUtils.decryptBytes(encryptedBase64, key, iv);
      return await crypto.subtle.importKey(
        'pkcs8',
        decrypted,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['decrypt']
      );
    }
  };
}

export async function decryptContent(passkey, password, encryptedContent) {
  try {
    const saltBytes = CryptoUtils.PrivateKeyUtils.decodeSalt(passkey.salt);
    const ivBytes = CryptoUtils.PrivateKeyUtils.decodeIv(passkey.iv);
    const privateKey = await CryptoUtils.PrivateKeyUtils.decryptPrivateKey(
      passkey.encryptedPrivateKey,
      password,
      saltBytes,
      ivBytes
    );
    const text = await CryptoUtils.RSAUtils.decryptWithPrivateKey(encryptedContent, privateKey);
    return text;
  } catch (e) {
    console.error('Decryption failed:', e?.message || e);
    throw new Error('Password mismatch or corrupt data');
  }
}


