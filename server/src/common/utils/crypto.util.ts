import { createHash, timingSafeEqual, randomBytes } from 'crypto';

export class CryptoUtil {
  static hash(data: string, algorithm: string = 'sha256'): string {
    return createHash(algorithm).update(data, 'utf8').digest('hex');
  }

  static constantTimeCompare(a: string, b: string): boolean {
    try {
      const bufA = Buffer.from(a, 'utf8');
      const bufB = Buffer.from(b, 'utf8');
      if (bufA.length !== bufB.length) return false;
      return timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }

  static generateRandomToken(byteLength: number = 32): string {
    return randomBytes(byteLength).toString('hex');
  }
}

