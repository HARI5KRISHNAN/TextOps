import crypto from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_MATERIAL = process.env.MESSAGE_ENCRYPTION_KEY;

if (!KEY_MATERIAL || KEY_MATERIAL.length < 32) {
    throw new Error('FATAL: MESSAGE_ENCRYPTION_KEY must be defined in .env and be at least 32 characters long.');
}

// Derive a 32-byte key from the environment variable
const ENCRYPTION_KEY = crypto.scryptSync(KEY_MATERIAL, 'salt', 32);

interface EncryptedMessage {
  ciphertext: string;
  iv: string;
  authTag: string;
}

export const encryptMessage = (plaintext: string): EncryptedMessage => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

export const decryptMessage = (encryptedData: EncryptedMessage): string => {
  try {
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      ENCRYPTION_KEY,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // In a real app, you might want to handle this more gracefully than throwing
    // e.g., return a specific error message to be displayed in the UI.
    throw new Error('Failed to decrypt message. Data may be corrupt or the key may have changed.');
  }
};
