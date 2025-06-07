import { MeasureUnit } from 'src/types';

export interface UnitConversionResult {
  convertedSize: number;
  success: boolean;
  originalUnit: MeasureUnit;
  targetUnit: MeasureUnit;
  conversionType:
    | 'same-category'
    | 'density-based'
    | 'product-specific'
    | 'failed'
    | 'forced-basic';
}

export interface ProductConversionRule {
  standardUnit: MeasureUnit;
  conversions: {
    [key in MeasureUnit]?: number;
  };
  aliases?: string[];
}

export class UnitConverter {
  private static readonly conversions = {
    [MeasureUnit.GRAM]: 1,
    [MeasureUnit.KILOGRAM]: 1000,
    [MeasureUnit.MILLILITER]: 1,
    [MeasureUnit.LITER]: 1000,
    [MeasureUnit.UNIT]: 1,
  };

  private static readonly productConversions: Record<
    string,
    ProductConversionRule
  > = {
    חלב: {
      standardUnit: MeasureUnit.LITER,
      conversions: {
        [MeasureUnit.LITER]: 1,
        [MeasureUnit.MILLILITER]: 1000,
        [MeasureUnit.KILOGRAM]: 0.97,
        [MeasureUnit.GRAM]: 970,
        [MeasureUnit.UNIT]: 1,
      },
      aliases: ['חלב טרי', 'חלב מפוסטר', 'חלב בקרטון'],
    },

    מים: {
      standardUnit: MeasureUnit.LITER,
      conversions: {
        [MeasureUnit.LITER]: 1,
        [MeasureUnit.MILLILITER]: 1000,
        [MeasureUnit.KILOGRAM]: 1,
        [MeasureUnit.GRAM]: 1000,
        [MeasureUnit.UNIT]: 1.5,
      },
      aliases: ['מים מינרליים', 'מי שתייה', 'מים'],
    },

    שמן: {
      standardUnit: MeasureUnit.LITER,
      conversions: {
        [MeasureUnit.LITER]: 1,
        [MeasureUnit.MILLILITER]: 1000,
        [MeasureUnit.KILOGRAM]: 1.09,
        [MeasureUnit.GRAM]: 1090,
        [MeasureUnit.UNIT]: 1,
      },
      aliases: ['שמן זית', 'שמן קנולה', 'שמן חמניות', 'שמן בישול'],
    },

    מיץ: {
      standardUnit: MeasureUnit.LITER,
      conversions: {
        [MeasureUnit.LITER]: 1,
        [MeasureUnit.MILLILITER]: 1000,
        [MeasureUnit.KILOGRAM]: 0.95,
        [MeasureUnit.GRAM]: 950,
        [MeasureUnit.UNIT]: 1,
      },
      aliases: ['מיץ תפוזים', 'מיץ ענבים', 'מיץ טבעי', 'מיץ טרי'],
    },

    אורז: {
      standardUnit: MeasureUnit.KILOGRAM,
      conversions: {
        [MeasureUnit.KILOGRAM]: 1,
        [MeasureUnit.GRAM]: 1000,
        [MeasureUnit.LITER]: 1.33,
        [MeasureUnit.MILLILITER]: 1330,
        [MeasureUnit.UNIT]: 1,
      },
      aliases: ['אורז לבן', 'אורז חום', 'אורז יסמין', 'אורז בסמטי'],
    },

    קמח: {
      standardUnit: MeasureUnit.KILOGRAM,
      conversions: {
        [MeasureUnit.KILOGRAM]: 1,
        [MeasureUnit.GRAM]: 1000,
        [MeasureUnit.LITER]: 2,
        [MeasureUnit.MILLILITER]: 2000,
        [MeasureUnit.UNIT]: 1,
      },
      aliases: ['קמח חיטה', 'קמח לבן', 'קמח מלא', 'קמח כוסמין'],
    },

    סוכר: {
      standardUnit: MeasureUnit.KILOGRAM,
      conversions: {
        [MeasureUnit.KILOGRAM]: 1,
        [MeasureUnit.GRAM]: 1000,
        [MeasureUnit.LITER]: 1.25,
        [MeasureUnit.MILLILITER]: 1250,
        [MeasureUnit.UNIT]: 1,
      },
      aliases: ['סוכר לבן', 'סוכר חום', 'סוכר גרנולציה'],
    },

    בצל: {
      standardUnit: MeasureUnit.KILOGRAM,
      conversions: {
        [MeasureUnit.KILOGRAM]: 1,
        [MeasureUnit.GRAM]: 1000,
        [MeasureUnit.UNIT]: 5,
      },
      aliases: ['בצל יבש', 'בצל לבן', 'בצל אדום', 'בצל ירוק'],
    },

    'תפוחי אדמה': {
      standardUnit: MeasureUnit.KILOGRAM,
      conversions: {
        [MeasureUnit.KILOGRAM]: 1,
        [MeasureUnit.GRAM]: 1000,
        [MeasureUnit.UNIT]: 6,
      },
      aliases: ['תפוח אדמה', 'תפו״א', 'תפוחי אדמה לבנים'],
    },

    עגבניות: {
      standardUnit: MeasureUnit.KILOGRAM,
      conversions: {
        [MeasureUnit.KILOGRAM]: 1,
        [MeasureUnit.GRAM]: 1000,
        [MeasureUnit.UNIT]: 8,
      },
      aliases: ['עגבנייה', 'עגבניות שרי', 'עגבניות גדולות'],
    },

    לחם: {
      standardUnit: MeasureUnit.UNIT,
      conversions: {
        [MeasureUnit.UNIT]: 1,
        [MeasureUnit.KILOGRAM]: 0.5,
        [MeasureUnit.GRAM]: 500,
      },
      aliases: ['לחם לבן', 'לחם מלא', 'לחם פרוס', 'כיכר לחם'],
    },

    ביצים: {
      standardUnit: MeasureUnit.UNIT,
      conversions: {
        [MeasureUnit.UNIT]: 1,
        [MeasureUnit.KILOGRAM]: 18,
        [MeasureUnit.GRAM]: 55,
      },
      aliases: ['ביצה', 'ביצי תרנגולת', 'ביצים טריות'],
    },

    פסטה: {
      standardUnit: MeasureUnit.GRAM,
      conversions: {
        [MeasureUnit.GRAM]: 1,
        [MeasureUnit.KILOGRAM]: 0.001,
        [MeasureUnit.UNIT]: 500,
      },
      aliases: ['ספגטי', 'מקרוני', 'פסטה קצרה', 'פסטה ארוכה'],
    },
  };

  private static findProductRule(
    productName: string,
  ): ProductConversionRule | null {
    const normalizedName = productName.toLowerCase().trim();

    if (this.productConversions[normalizedName]) {
      return this.productConversions[normalizedName];
    }

    for (const [key, rule] of Object.entries(this.productConversions)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return rule;
      }

      if (rule.aliases) {
        for (const alias of rule.aliases) {
          if (
            normalizedName.includes(alias.toLowerCase()) ||
            alias.toLowerCase().includes(normalizedName)
          ) {
            return rule;
          }
        }
      }
    }

    return null;
  }

  static convertUnits(
    size: number,
    fromUnit: MeasureUnit,
    toUnit: MeasureUnit,
    productName?: string,
  ): UnitConversionResult {
    if (fromUnit === toUnit) {
      return {
        convertedSize: size,
        success: true,
        originalUnit: fromUnit,
        targetUnit: toUnit,
        conversionType: 'same-category',
      };
    }

    if (productName) {
      const productRule = this.findProductRule(productName);
      if (
        productRule &&
        productRule.conversions[fromUnit] &&
        productRule.conversions[toUnit]
      ) {
        const fromFactor = productRule.conversions[fromUnit]!;
        const toFactor = productRule.conversions[toUnit]!;

        const standardAmount = size / fromFactor;
        const convertedSize = standardAmount * toFactor;

        return {
          convertedSize: Math.round(convertedSize * 100) / 100,
          success: true,
          originalUnit: fromUnit,
          targetUnit: toUnit,
          conversionType: 'product-specific',
        };
      }
    }

    if (this.areSameCategory(fromUnit, toUnit)) {
      const result = this.convertSameCategory(size, fromUnit, toUnit);
      return {
        convertedSize: result,
        success: true,
        originalUnit: fromUnit,
        targetUnit: toUnit,
        conversionType: 'same-category',
      };
    }

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
          conversionType: 'density-based',
        };
      }
    }

    console.warn(
      `Forcing basic conversion for ${productName}: ${size} ${fromUnit} -> ${toUnit}`,
    );

    const forceConvertedSize = this.forceBasicConversion(
      size,
      fromUnit,
      toUnit,
    );

    return {
      convertedSize: forceConvertedSize,
      success: true,
      originalUnit: fromUnit,
      targetUnit: toUnit,
      conversionType: 'forced-basic',
    };
  }

  private static forceBasicConversion(
    size: number,
    fromUnit: MeasureUnit,
    toUnit: MeasureUnit,
  ): number {
    const basicConversions = {
      [`${MeasureUnit.KILOGRAM}-${MeasureUnit.GRAM}`]: 1000,
      [`${MeasureUnit.GRAM}-${MeasureUnit.KILOGRAM}`]: 0.001,

      [`${MeasureUnit.LITER}-${MeasureUnit.MILLILITER}`]: 1000,
      [`${MeasureUnit.MILLILITER}-${MeasureUnit.LITER}`]: 0.001,

      [`${MeasureUnit.KILOGRAM}-${MeasureUnit.LITER}`]: 1,
      [`${MeasureUnit.LITER}-${MeasureUnit.KILOGRAM}`]: 1,
      [`${MeasureUnit.GRAM}-${MeasureUnit.MILLILITER}`]: 1,
      [`${MeasureUnit.MILLILITER}-${MeasureUnit.GRAM}`]: 1,
      [`${MeasureUnit.KILOGRAM}-${MeasureUnit.MILLILITER}`]: 1000,
      [`${MeasureUnit.MILLILITER}-${MeasureUnit.KILOGRAM}`]: 0.001,
      [`${MeasureUnit.GRAM}-${MeasureUnit.LITER}`]: 0.001,
      [`${MeasureUnit.LITER}-${MeasureUnit.GRAM}`]: 1000,

      [`${MeasureUnit.UNIT}-${MeasureUnit.KILOGRAM}`]: 0.5,
      [`${MeasureUnit.KILOGRAM}-${MeasureUnit.UNIT}`]: 2,
      [`${MeasureUnit.UNIT}-${MeasureUnit.GRAM}`]: 500,
      [`${MeasureUnit.GRAM}-${MeasureUnit.UNIT}`]: 0.002,
      [`${MeasureUnit.UNIT}-${MeasureUnit.LITER}`]: 1,
      [`${MeasureUnit.LITER}-${MeasureUnit.UNIT}`]: 1,
      [`${MeasureUnit.UNIT}-${MeasureUnit.MILLILITER}`]: 1000,
      [`${MeasureUnit.MILLILITER}-${MeasureUnit.UNIT}`]: 0.001,
    };

    const conversionKey = `${fromUnit}-${toUnit}`;
    const conversionFactor = basicConversions[conversionKey];

    if (conversionFactor) {
      return Math.round(size * conversionFactor * 100) / 100;
    }

    console.warn(
      `No basic conversion found for ${fromUnit} -> ${toUnit}, using original size`,
    );
    return size;
  }

  static areUnitsCompatible(
    unit1: MeasureUnit,
    unit2: MeasureUnit,
    productName?: string,
  ): boolean {
    if (unit1 === unit2) return true;

    if (productName) {
      const productRule = this.findProductRule(productName);
      if (productRule) {
        const hasUnit1 = productRule.conversions[unit1] !== undefined;
        const hasUnit2 = productRule.conversions[unit2] !== undefined;
        if (hasUnit1 && hasUnit2) return true;
      }
    }

    if (this.areSameCategory(unit1, unit2)) return true;
    if (productName && this.canConvertWeightVolume(unit1, unit2, productName))
      return true;

    return true;
  }

  static getPreferredUnit(
    size: number,
    currentUnit: MeasureUnit,
    productName?: string,
  ): MeasureUnit {
    if (productName) {
      const productRule = this.findProductRule(productName);
      if (productRule) {
        return productRule.standardUnit;
      }
    }

    if (currentUnit === MeasureUnit.GRAM && size >= 1000) {
      return MeasureUnit.KILOGRAM;
    }
    if (currentUnit === MeasureUnit.KILOGRAM && size < 1) {
      return MeasureUnit.GRAM;
    }
    if (currentUnit === MeasureUnit.MILLILITER && size >= 1000) {
      return MeasureUnit.LITER;
    }
    if (currentUnit === MeasureUnit.LITER && size < 1) {
      return MeasureUnit.MILLILITER;
    }

    return currentUnit;
  }

  static mergeQuantities(
    existingSize: number,
    existingUnit: MeasureUnit,
    newSize: number,
    newUnit: MeasureUnit,
    productName?: string,
  ): {
    size: number;
    unit: MeasureUnit;
    converted: boolean;
    conversionType?: string;
  } {
    const conversionResult = this.convertUnits(
      newSize,
      newUnit,
      existingUnit,
      productName,
    );

    const totalSize = existingSize + conversionResult.convertedSize;
    const preferredUnit = this.getPreferredUnit(
      totalSize,
      existingUnit,
      productName,
    );

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
        conversionType: finalConversion.conversionType,
      };
    }

    return {
      size: totalSize,
      unit: existingUnit,
      converted: conversionResult.success && newUnit !== existingUnit,
      conversionType: conversionResult.conversionType,
    };
  }

  static areSameCategory(unit1: MeasureUnit, unit2: MeasureUnit): boolean {
    const weightUnits = [MeasureUnit.GRAM, MeasureUnit.KILOGRAM];
    const volumeUnits = [MeasureUnit.MILLILITER, MeasureUnit.LITER];

    if (weightUnits.includes(unit1) && weightUnits.includes(unit2)) return true;
    if (volumeUnits.includes(unit1) && volumeUnits.includes(unit2)) return true;
    if (unit1 === MeasureUnit.UNIT && unit2 === MeasureUnit.UNIT) return true;

    return false;
  }

  private static convertSameCategory(
    size: number,
    fromUnit: MeasureUnit,
    toUnit: MeasureUnit,
  ): number {
    const fromRatio = this.conversions[fromUnit];
    const toRatio = this.conversions[toUnit];

    const baseAmount = size * fromRatio;
    const convertedAmount = baseAmount / toRatio;

    return Math.round(convertedAmount * 100) / 100;
  }

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
    קמח: 0.5,
    סוכר: 0.8,
    אורז: 0.75,
  };

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

    if (
      !((isUnit1Weight && isUnit2Volume) || (isUnit1Volume && isUnit2Weight))
    ) {
      return false;
    }

    return this.getProductDensity(productName) !== null;
  }

  private static getProductDensity(productName: string): number | null {
    if (this.productDensities[productName]) {
      return this.productDensities[productName];
    }

    for (const [key, density] of Object.entries(this.productDensities)) {
      if (productName.includes(key) || key.includes(productName)) {
        return density;
      }
    }

    return null;
  }

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
      let grams = fromUnit === MeasureUnit.KILOGRAM ? size * 1000 : size;
      let ml = grams / density;
      result = toUnit === MeasureUnit.LITER ? ml / 1000 : ml;
    } else {
      let ml = fromUnit === MeasureUnit.LITER ? size * 1000 : size;
      let grams = ml * density;
      result = toUnit === MeasureUnit.KILOGRAM ? grams / 1000 : grams;
    }

    return Math.round(result * 100) / 100;
  }
}
