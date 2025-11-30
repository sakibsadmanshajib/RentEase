import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const IV_LENGTH = 16; // For AES, this is always 16

@Injectable()
export class EncryptionService {
    private static encryptionKey: string;

    constructor(private configService: ConfigService) {
        const key = this.configService.get<string>('ENCRYPTION_KEY');
        if (!key) {
            throw new Error('ENCRYPTION_KEY is not defined in environment variables');
        }
        if (key.length !== 32) {
            throw new Error('ENCRYPTION_KEY must be 32 characters long');
        }
        EncryptionService.encryptionKey = key;
    }

    static encrypt(text: string): string {
        if (!text) return text;
        if (!this.encryptionKey) {
            // This static method might be called before the service is instantiated if used in models directly.
            // However, in NestJS, we should rely on dependency injection or ensure initialization.
            // Since we are using it in models (getters/setters), we need a way to access the config.
            // A common pattern for static usage is to initialize it at bootstrap or use a singleton.
            // For now, let's assume it's initialized or we change the model to not use static methods if possible.
            // But wait, the model uses it in getters/setters.
            // Let's use process.env as a fallback ONLY if the service hasn't been initialized, but still enforce it being present.
            const key = process.env.ENCRYPTION_KEY;
            if (!key) throw new Error('ENCRYPTION_KEY is missing');
            this.encryptionKey = key;
        }

        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(this.encryptionKey), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        const authTag = cipher.getAuthTag();
        return iv.toString('hex') + ':' + encrypted.toString('hex') + ':' + authTag.toString('hex');
    }

    static decrypt(text: string): string {
        if (!text) return text;
        if (!this.encryptionKey) {
            const key = process.env.ENCRYPTION_KEY;
            if (!key) throw new Error('ENCRYPTION_KEY is missing');
            this.encryptionKey = key;
        }

        const textParts = text.split(':');
        if (textParts.length !== 3) return text; // Not encrypted or invalid format

        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');
        const authTag = Buffer.from(textParts[2], 'hex');

        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(this.encryptionKey), iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}
