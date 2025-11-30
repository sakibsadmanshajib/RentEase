import * as crypto from 'crypto';

// TODO: Move to environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16

export class EncryptionService {
    static encrypt(text: string): string {
        if (!text) return text;
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        const authTag = cipher.getAuthTag();
        return iv.toString('hex') + ':' + encrypted.toString('hex') + ':' + authTag.toString('hex');
    }

    static decrypt(text: string): string {
        if (!text) return text;
        const textParts = text.split(':');
        if (textParts.length !== 3) return text; // Not encrypted or invalid format

        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');
        const authTag = Buffer.from(textParts[2], 'hex');

        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}
