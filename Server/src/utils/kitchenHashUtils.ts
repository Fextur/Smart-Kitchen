import * as crypto from 'crypto';

export class KitchenHashUtils {
  static generateRandomKitchenHash(): string {
    const chars = 'ABCDEF0123456789';
    let result = '';

    for (let i = 0; i < 7; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      result += chars[randomIndex];
    }

    return result;
  }

  static isValidHashFormat(hash: string): boolean {
    return /^[A-F0-9]{7}$/.test(hash);
  }
}
