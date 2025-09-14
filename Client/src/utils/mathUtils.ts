export class MathUtils {
  /**
   * Rounds a number to specified decimal places, fixing floating point precision
   */
  static round(num: number, decimalPlaces: number = 2): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  }

  /**
   * Intelligent rounding that chooses appropriate decimal places
   */
  static smartRound(num: number): number {
    // If it's essentially a whole number, return it as integer
    if (Math.abs(num - Math.round(num)) < 0.0001) {
      return Math.round(num);
    }

    // If it's close to a single decimal place, round to 1 decimal
    if (Math.abs(num - Math.round(num * 10) / 10) < 0.001) {
      return Math.round(num * 10) / 10;
    }

    // Otherwise round to 2 decimal places
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  /**
   * Formats a number for display, removing unnecessary trailing zeros
   */
  static formatForDisplay(num: number): string {
    const rounded = this.smartRound(num);
    return rounded.toString();
  }
}
