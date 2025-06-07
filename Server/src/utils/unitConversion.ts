// Server/src/utils/unitConversion.ts
import { MeasureUnit } from 'src/types';

export interface UnitConversionResult {
  convertedSize: number;
  success: boolean;
  originalUnit: MeasureUnit;
  targetUnit: MeasureUnit;
}

export class UnitConverter {
  // Unit categories and conversions
  private static readonly conversions = {
    // Weight conversions (to grams as base)
    [MeasureUnit.GRAM]: 1,
    [MeasureUnit.KILOGRAM]: 1000,

    // Volume conversions (to milliliters as base)
    [MeasureUnit.MILLILITER]: 1,
    [MeasureUnit.LITER]: 1000,

    // Count (no conversion)
    [MeasureUnit.UNIT]: 1,
  };

  // Weight-volume conversions for specific products (ml to gram ratio)
  private static readonly productDensities = {
    מים: 1.0,
    חלב: 1.03,
    שמן: 0.92,
    'שמן זית': 0.92,
    מיץ: 1.05,
    קטשופ: 1.1,
    מיונז: 0.91,
    דבש: 1.4,
    חומץ: 1.01,
    רוטב: 1.1,
    // Cooking ingredients (approximate)
    קמח: 0.5,
    סוכר: 0.8,
    אורז: 0.75,
  };

  /**
   * Check if two units are in the same category
   */
  static areSameCategory(unit1: MeasureUnit, unit2: MeasureUnit): boolean {
    const weightUnits = [MeasureUnit.GRAM, MeasureUnit.KILOGRAM];
    const volumeUnits = [MeasureUnit.MILLILITER, MeasureUnit.LITER];

    if (weightUnits.includes(unit1) && weightUnits.includes(unit2)) return true;
    if (volumeUnits.includes(unit1) && volumeUnits.includes(unit2)) return true;
    if (unit1 === MeasureUnit.UNIT && unit2 === MeasureUnit.UNIT) return true;

    return false;
  }

  /**
   * Check if weight-volume conversion is possible for a product
   */
  static canConvertWeightVolume(
    unit1: MeasureUnit,
    unit2: MeasureUnit,
    productName: string,
  ): boolean {
    const weightUnits = [MeasureUnit.GRAM, MeasureUnit.KILOGRAM];
    const volumeUnits = [MeasureUnit.MILLILITER, MeasureUnit.LITER];

    const isUnit1Weight = weightUnits.includes(unit1);
    const isUnit2Volume = volumeUnits.includes(unit2);
    const isUnit1Volume = volumeUnits.includes(unit1);
    const isUnit2Weight = weightUnits.includes(unit2);

    // Must be different categories (one weight, one volume)
    if (
      !((isUnit1Weight && isUnit2Volume) || (isUnit1Volume && isUnit2Weight))
    ) {
      return false;
    }

    // Check if we have density data for this product
    return this.getProductDensity(productName) !== null;
  }

  /**
   * Get density for a product (or find similar product)
   */
  private static getProductDensity(productName: string): number | null {
    // Direct match
    if (this.productDensities[productName]) {
      return this.productDensities[productName];
    }

    // Fuzzy match - check if product name contains any known keywords
    for (const [key, density] of Object.entries(this.productDensities)) {
      if (productName.includes(key) || key.includes(productName)) {
        return density;
      }
    }

    return null;
  }

  /**
   * Convert units - main conversion function
   */
  static convertUnits(
    size: number,
    fromUnit: MeasureUnit,
    toUnit: MeasureUnit,
    productName?: string,
  ): UnitConversionResult {
    // Same units - no conversion needed
    if (fromUnit === toUnit) {
      return {
        convertedSize: size,
        success: true,
        originalUnit: fromUnit,
        targetUnit: toUnit,
      };
    }

    // Try same-category conversion first
    if (this.areSameCategory(fromUnit, toUnit)) {
      const result = this.convertSameCategory(size, fromUnit, toUnit);
      return {
        convertedSize: result,
        success: true,
        originalUnit: fromUnit,
        targetUnit: toUnit,
      };
    }

    // Try weight-volume conversion if product name provided
    if (
      productName &&
      this.canConvertWeightVolume(fromUnit, toUnit, productName)
    ) {
      const result = this.convertWeightVolume(
        size,
        fromUnit,
        toUnit,
        productName,
      );
      if (result !== null) {
        return {
          convertedSize: result,
          success: true,
          originalUnit: fromUnit,
          targetUnit: toUnit,
        };
      }
    }

    // Cannot convert
    return {
      convertedSize: size,
      success: false,
      originalUnit: fromUnit,
      targetUnit: fromUnit, // Keep original unit
    };
  }

  /**
   * Convert within same category (weight or volume)
   */
  private static convertSameCategory(
    size: number,
    fromUnit: MeasureUnit,
    toUnit: MeasureUnit,
  ): number {
    const fromRatio = this.conversions[fromUnit];
    const toRatio = this.conversions[toUnit];

    // Convert to base unit, then to target unit
    const baseAmount = size * fromRatio;
    const convertedAmount = baseAmount / toRatio;

    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert between weight and volume using product density
   */
  private static convertWeightVolume(
    size: number,
    fromUnit: MeasureUnit,
    toUnit: MeasureUnit,
    productName: string,
  ): number | null {
    const density = this.getProductDensity(productName);
    if (!density) return null;

    const weightUnits = [MeasureUnit.GRAM, MeasureUnit.KILOGRAM];
    const isFromWeight = weightUnits.includes(fromUnit);

    let result: number;

    if (isFromWeight) {
      // Weight to volume: grams to ml, then convert to target volume unit
      let grams = fromUnit === MeasureUnit.KILOGRAM ? size * 1000 : size;
      let ml = grams / density;
      result = toUnit === MeasureUnit.LITER ? ml / 1000 : ml;
    } else {
      // Volume to weight: ml to grams, then convert to target weight unit
      let ml = fromUnit === MeasureUnit.LITER ? size * 1000 : size;
      let grams = ml * density;
      result = toUnit === MeasureUnit.KILOGRAM ? grams / 1000 : grams;
    }

    return Math.round(result * 100) / 100;
  }

  /**
   * Check if two units are compatible for a product
   */
  static areUnitsCompatible(
    unit1: MeasureUnit,
    unit2: MeasureUnit,
    productName?: string,
  ): boolean {
    if (unit1 === unit2) return true;
    if (this.areSameCategory(unit1, unit2)) return true;
    if (productName && this.canConvertWeightVolume(unit1, unit2, productName))
      return true;
    return false;
  }

  /**
   * Get the preferred unit for a product based on size and context
   */
  static getPreferredUnit(size: number, currentUnit: MeasureUnit): MeasureUnit {
    // For weight: use kg for amounts >= 1000g
    if (currentUnit === MeasureUnit.GRAM && size >= 1000) {
      return MeasureUnit.KILOGRAM;
    }
    if (currentUnit === MeasureUnit.KILOGRAM && size < 1) {
      return MeasureUnit.GRAM;
    }

    // For volume: use L for amounts >= 1000ml
    if (currentUnit === MeasureUnit.MILLILITER && size >= 1000) {
      return MeasureUnit.LITER;
    }
    if (currentUnit === MeasureUnit.LITER && size < 1) {
      return MeasureUnit.MILLILITER;
    }

    return currentUnit;
  }

  /**
   * Smart merge - merge two quantities with unit conversion
   */
  static mergeQuantities(
    existingSize: number,
    existingUnit: MeasureUnit,
    newSize: number,
    newUnit: MeasureUnit,
    productName?: string,
  ): { size: number; unit: MeasureUnit; converted: boolean } {
    if (!this.areUnitsCompatible(existingUnit, newUnit, productName)) {
      // Cannot merge incompatible units
      return {
        size: existingSize,
        unit: existingUnit,
        converted: false,
      };
    }

    // Convert new size to existing unit
    const conversionResult = this.convertUnits(
      newSize,
      newUnit,
      existingUnit,
      productName,
    );

    if (!conversionResult.success) {
      return {
        size: existingSize,
        unit: existingUnit,
        converted: false,
      };
    }

    const totalSize = existingSize + conversionResult.convertedSize;
    const preferredUnit = this.getPreferredUnit(totalSize, existingUnit);

    // If preferred unit is different, convert the total
    if (preferredUnit !== existingUnit) {
      const finalConversion = this.convertUnits(
        totalSize,
        existingUnit,
        preferredUnit,
        productName,
      );
      return {
        size: finalConversion.convertedSize,
        unit: preferredUnit,
        converted: true,
      };
    }

    return {
      size: totalSize,
      unit: existingUnit,
      converted: conversionResult.success && newUnit !== existingUnit,
    };
  }
}
