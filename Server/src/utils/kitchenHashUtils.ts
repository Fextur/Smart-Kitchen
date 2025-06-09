import * as crypto from 'crypto';

export class KitchenHashUtils {
  /**
   * Generate a 7-character hash from inventory ID
   */
  static generateKitchenHash(inventoryId: string): string {
    const hash = crypto.createHash('sha256').update(inventoryId).digest('hex');
    return hash.substring(0, 7).toUpperCase();
  }

  /**
   * Validate if a hash matches the expected format
   */
  static isValidHashFormat(hash: string): boolean {
    return /^[A-F0-9]{7}$/.test(hash);
  }
}
