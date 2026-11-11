import { randomUUID } from 'crypto';
import { CryptoUtil } from './crypto.util';

export class UuidUtil {
  static generate(): string {
    return randomUUID();
  }

  /** @deprecated use CryptoUtil.generateRandomToken */
  static generateToken(byteLength: number = 32): string {
    return CryptoUtil.generateRandomToken(byteLength);
  }

  /** @deprecated use CryptoUtil.generateNumericCode */
  static generateNumericOtp(digits: number = 6): string {
    return CryptoUtil.generateNumericCode(digits);
  }

  static generatePublicId(prefix: string = 'id'): string {
    return `${prefix}_${Date.now().toString(36)}${CryptoUtil.generateRandomToken(4)}`;
  }
}
