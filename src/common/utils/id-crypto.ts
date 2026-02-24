import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';



const IV_LENGTH = 16;

function getSecretKey(): Buffer {
  if (!SECRET || SECRET.length !== 32) {
    throw new Error('ID_SECRET must be exactly 32 characters');
  }
  return Buffer.from(SECRET);
}

export function encryptId(id: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(id, 'utf8'),
    cipher.final(),
  ]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptId(encryptedId: string): string {
  const parts = encryptedId.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted ID format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = Buffer.from(parts[1], 'hex');

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getSecretKey(),
    iv,
  );

  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
    