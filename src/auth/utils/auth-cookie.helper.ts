import { Response } from 'express';
import crypto from 'crypto';

// Por defecto usamos el timeout de sesión (SESSION_TIMEOUT_MINUTES) para
// asegurar que la cookie dure al menos tanto como la sesión en servidor.
const DEFAULT_MAX_AGE = (Number(process.env.SESSION_TIMEOUT_MINUTES ?? '') || 15) * 60 * 1000;

function getKey(): Buffer {
    const raw = process.env.COOKIE_ENCRYPTION_KEY ?? '';
    if (!raw) return null as any;

    // Si el valor parece un hex de 64 chars (32 bytes), usarlo directamente,
    // sino derivar una clave SHA-256 del string proporcionado.
    if (/^[0-9a-fA-F]{64}$/.test(raw)) {
        return Buffer.from(raw, 'hex');
    }
    return crypto.createHash('sha256').update(raw).digest();
}

export const encryptToken = (plain: string): string => {
    const key = getKey();
    if (!key) return plain; // Si no hay clave, no cifrar (comportamiento por compatibilidad)

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    // Guardamos iv + payload en base64 separados por ':'
    return iv.toString('base64') + ':' + encrypted.toString('base64');
};

export const decryptToken = (cipherText: string): string => {
    const key = getKey();
    if (!key) return cipherText; // Si no hay clave, asumimos que no está cifrado

    const parts = cipherText.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted token format');
    const iv = Buffer.from(parts[0], 'base64');
    const encrypted = Buffer.from(parts[1], 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
};

export const setAuthCookie = (res: Response, token: string) => {
    const value = encryptToken(token);
    // Determinar si hay HTTPS disponible (certificados configurados)
    const hasHttps = !!(process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH);

    // Use SameSite=None only when Secure is enabled (HTTPS). Modern browsers
    // will reject cookies with SameSite=None unless Secure=true. For local
    // development without HTTPS, fall back to 'lax' to ensure the cookie is
    // accepted and sent by the browser (different ports on localhost are
    // considered same-site by registrable domain rules).
    const secureFlag = hasHttps;
    const sameSiteVal: any = secureFlag ? 'none' : 'lax';

    const configuredMax = Number(process.env.AUTH_COOKIE_MAX_AGE ?? DEFAULT_MAX_AGE);
    res.cookie('jwt', value, {
        httpOnly: true,
        secure: secureFlag,
        sameSite: sameSiteVal,
        maxAge: configuredMax,
    });
};

export const clearAuthCookie = (res: Response) => {
    res.clearCookie('jwt');
};
