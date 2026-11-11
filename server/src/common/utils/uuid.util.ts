import { randomUUID, randomBytes } from 'crypto';

export class UuidUtil {
  static generate(): string {
    return randomUUID();
  }

  static generateToken(byteLength: number = 32): string {
    return randomBytes(byteLength).toString('hex');
  }

  static generateNumericOtp(digits: number = 6): string {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  static generatePublicId(prefix: string = 'id'): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(4).toString('hex');
    return `${prefix}_${timestamp}${random}`;
  }
}

