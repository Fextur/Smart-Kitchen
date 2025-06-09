import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { Product } from 'src/Products/product.entity';
import { UnitConverter } from 'src/utils/unitConversion';
import { MeasureUnit } from 'src/types';

export interface ProductMatch {
  productName: string;
  matchedProduct: Product | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
  reason?: string;
  unitCompatibility?: {
    compatible: boolean;
    conversionType?: string;
    preferredUnit?: MeasureUnit;
  };
}

export interface ProductMatchingResult {
  matches: ProductMatch[];
}

@Injectable()
export class ProductMatchingService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async findMatchingProducts(
    newProductNames: string[],
    inventoryId: string,
    existingProductsList?: Product[],
  ): Promise<ProductMatchingResult> {
    const existingProducts =
      existingProductsList ||
      (await this.productRepository.find({
        where: { inventory: { id: inventoryId } },
        select: ['id', 'name', 'measureUnit', 'size'],
      }));

    if (existingProducts.length === 0) {
      return {
        matches: newProductNames.map((name) => ({
          productName: name,
          matchedProduct: null,
          confidence: 'none',
        })),
      };
    }

    const matches = await this.analyzeProductMatches(
      newProductNames,
      existingProducts,
    );

    return { matches };
  }

  private async analyzeProductMatches(
    newProductNames: string[],
    existingProducts: Product[],
  ): Promise<ProductMatch[]> {
    const existingProductsList = existingProducts
      .map((p) => `${p.name} (${p.measureUnit})`)
      .join(', ');

    const prompt = `
    אתה מומחה בזיהוי מוצרי מזון והתאמתם. המטרה: למנוע כפילויות מיותרות בלי להיות קיצוני מדי!
    
    רשימת מוצרים קיימים במלאי:
    ${existingProductsList}
    
    מוצרים חדשים לבדיקה:
    ${newProductNames.join(', ')}
    
    **כללים מאוזנים לזיהוי:**
    
    🟢 **יש למזג (high/medium confidence):**
    
    **1. וריאציות ברורות של אותו מוצר:**
    - "זיתים" ו"זיתים שחורים" ו"זיתים ירוקים" (צבעים שונים של זיתים)
    - "זיתים" ו"זיתים שטראוס" (מותגים שונים של זיתים)  
    - "זית" ו"זיתים" (יחיד vs רבים של אותו דבר)
    - "חלב" ו"חלב תנובה" ו"חלב 3%" (מותגים ואחוזי שומן)
    - "יוגורט" ו"יוגורט טבעי" ו"יוגורט דנונה" (מותגים וסוגים)
    - "לחם" ו"לחם מלא" ו"לחם ברמן" (סוגים ומותגים)
    
    **2. תיאורים שונים של אותו מוצר:**
    - "פלאפל" ו"פלאפל צבר" (מותג שונה)
    - "בננות" ו"בננות אקוואדור" (מקור שונה)
    - "תפוחים" ו"תפוחים אדומים" (צבע מוגדר)
    
    **3. יחידות מידה שונות:**
    - "חלב" (ליטר) ו"חלב" (קילוגרם) - אותו מוצר
    
    🟡 **תלוי בהקשר (medium/low confidence):**
    
    **1. גדלים שונים באותה משפחה:**
    - "עגבניות" ו"עגבניות שרי" - **medium** (עדיין עגבניות, גדל שונה)
    - "בצל" ו"בצל ירוק" - **medium** (שניהם בצל, סוג שונה)
    
    **2. חלקים שונים של אותו דבר:**
    - "עוף" ו"חזה עוף" - **low** (חלק vs שלם)
    
    🔴 **אסור למזג (none confidence):**
    
    **1. עיבוד מול טרי:**
    - "זיתים" ≠ "שמן זית" (פרי vs שמן מעובד)
    - "תפוזים" ≠ "מיץ תפוזים" (פרי vs משקה)
    - "בוטנים" ≠ "חמאת בוטנים" (אגוז vs ממרח)
    
    **2. זנים שונים לחלוטין:**
    - "פלפל אדום" ≠ "פלפל חריף" (מתוק vs חריף - זנים שונים)
    - "תפוחים ירוקים" ≠ "תפוחים אדומים" - **אבל זה medium** (עדיין תפוחים)
    
    **3. מוצרים שונים עם שמות דומים:**
    - "פלאפל" ≠ "פלפל"
    - "חומוס" ≠ "חומץ"
    
    **דוגמאות מדויקות מהמקרה שלך:**
    
    ✅ **יש למזג:**
    - "זיתים" + "זיתים שחורים" → **high** (אותו פרי, צבע שונה)
    - "זיתים" + "זיתים שטראוס" → **high** (אותו פרי, מותג שונה)
    - "זית" + "זיתים" → **high** (יחיד vs רבים)
    
    ❌ **אסור למזג:**
    - "זיתים" + "שמן זית" → **none** (פרי vs שמן מעובד)
    
    **עקרון מנחה: אם זה אותו מוצר עם תיאור שונה/מותג שונה/צבע שונה - מזגו!**
    **אם זה עיבוד שונה או זן שונה לחלוטין - הפרידו!**
    
    רמות ביטחון:
    - **high**: אותו מוצר, הבדל קטן (מותג/צבע/גודל)
    - **medium**: כנראה אותו מוצר, הבדל קצת יותר גדול
    - **low**: יכול להיות קשור
    - **none**: מוצרים שונים או עיבוד שונה
    
    החזר JSON:
    {
      "matches": [
        {
          "productName": "שם המוצר החדש",
          "matchedProductName": "שם המוצר הקיים" או null,
          "confidence": "high/medium/low/none",
          "reason": "הסבר קצר"
        }
      ]
    }
  `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'אתה מומחה בזיהוי מוצרי מזון עם גישה מאוזנת. מזגו וריאציות של אותו מוצר (זיתים+זיתים שחורים, חלב+חלב תנובה) אבל הפרידו עיבוד שונה (זיתים≠שמן זית). אל תהיה קיצוני מדי - צבעים ומותגים שונים של אותו מוצר צריכים להתמזג. תחזיר JSON תקין.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.2,
      });

      const responseContent = response.choices[0].message?.content?.trim();
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      const aiResult = JSON.parse(responseContent);

      const matches: ProductMatch[] = aiResult.matches.map((match: any) => {
        let matchedProduct: Product | null = null;
        let unitCompatibility: ProductMatch['unitCompatibility'];
        let adjustedConfidence = match.confidence;

        if (match.matchedProductName && match.confidence !== 'none') {
          matchedProduct =
            existingProducts.find((p) => {
              const exactMatch = p.name === match.matchedProductName;
              const containsMatch =
                match.matchedProductName.includes(p.name) ||
                p.name.includes(match.matchedProductName);

              return exactMatch || containsMatch;
            }) || null;

          if (matchedProduct) {
            const falsePositiveCheck = this.checkForFalsePositive(
              match.productName,
              matchedProduct.name,
            );

            if (falsePositiveCheck.isFalsePositive) {
              console.warn(
                `Prevented false positive match: ${match.productName} ≠ ${matchedProduct.name} (${falsePositiveCheck.reason})`,
              );
              matchedProduct = null;
              adjustedConfidence = 'none';
            } else {
              unitCompatibility = this.checkUnitCompatibility(
                match.productName,
                matchedProduct,
              );
            }
          }
        }

        return {
          productName: match.productName,
          matchedProduct,
          confidence: adjustedConfidence,
          reason: match.reason,
          unitCompatibility,
        };
      });

      return matches;
    } catch (error) {
      console.error('Error in product matching:', error);

      return newProductNames.map((name) => ({
        productName: name,
        matchedProduct: null,
        confidence: 'none' as const,
        reason: 'שגיאה בניתוח ההתאמה',
      }));
    }
  }

  private checkForFalsePositive(
    newProductName: string,
    existingProductName: string,
  ): { isFalsePositive: boolean; reason?: string } {
    const normalize = (name: string) => name.toLowerCase().trim();
    const newName = normalize(newProductName);
    const existingName = normalize(existingProductName);

    const categoryMismatches = [
      {
        patterns: ['מיץ', 'תפוזים'],
        reason: 'מיץ תפוזים (משקה) vs תפוזים (פרי טרי) - מוצרים שונים',
      },
      {
        patterns: ['מיץ', 'תפוחים'],
        reason: 'מיץ תפוחים (משקה) vs תפוחים (פרי טרי) - מוצרים שונים',
      },
      {
        patterns: ['מיץ', 'ענבים'],
        reason: 'מיץ ענבים (משקה) vs ענבים (פרי טרי) - מוצרים שונים',
      },
      {
        patterns: ['מיץ', 'לימון'],
        reason: 'מיץ לימון vs לימון טרי - מוצרים שונים',
      },

      {
        patterns: ['רוטב', 'עגבניות'],
        reason: 'רוטב עגבניות (מוצר מעובד) vs עגבניות (ירק טרי) - מוצרים שונים',
      },
      {
        patterns: ['ממרח', 'שוקולד'],
        reason: 'ממרח שוקולד vs שוקולד - מוצרים שונים',
      },
      {
        patterns: ['קמח', 'חיטה'],
        reason: 'קמח (מוצר מעובד) vs חיטה (דגן גולמי) - מוצרים שונים',
      },

      {
        patterns: ['שמן', 'זיתים'],
        reason: 'שמן זית (מוצר מעובד) vs זיתים (פרי שלם) - מוצרים שונים',
      },
      {
        patterns: ['שמן', 'חמניות'],
        reason: 'שמן חמניות vs זרעי חמניות - מוצרים שונים',
      },

      {
        patterns: ['חמאת', 'בוטנים'],
        reason: 'חמאת בוטנים (ממרח) vs בוטנים (אגוזים שלמים) - מוצרים שונים',
      },
      {
        patterns: ['חמאת', 'שקדים'],
        reason: 'חמאת שקדים vs שקדים שלמים - מוצרים שונים',
      },

      {
        patterns: ['פלפל אדום', 'פלפל ירוק'],
        reason: 'פלפל אדום vs פלפל ירוק - זנים שונים של פלפל',
      },
      {
        patterns: ['פלפל אדום', 'פלפל חריף'],
        reason: 'פלפל אדום vs פלפל חריף - זנים שונים של פלפל',
      },
      {
        patterns: ['פלפל ירוק', 'פלפל חריף'],
        reason: 'פלפל ירוק vs פלפל חריף - זנים שונים של פלפל',
      },

      {
        patterns: ['עגבניות שרי', 'עגבניות'],
        reason: 'עגבניות שרי vs עגבניות רגילות - גדלים שונים',
      },

      { patterns: ['בשר', 'חלב'], reason: 'בשר vs מוצרי חלב - קטגוריות שונות' },
      { patterns: ['עוף', 'גבינה'], reason: 'עוף vs גבינה - קטגוריות שונות' },

      {
        patterns: ['פלאפל', 'פלפל'],
        reason: 'פלאפל (כדורי חומוס) vs פלפל (ירק) - מוצרים שונים',
      },
      {
        patterns: ['חומוס', 'חומץ'],
        reason: 'חומוס (ממרח) vs חומץ (נוזל חמצמץ) - מוצרים שונים',
      },
      {
        patterns: ['טחינה', 'טחון'],
        reason: 'טחינה (ממרח שומשום) vs בשר טחון - מוצרים שונים',
      },
      {
        patterns: ['קוסקוס', 'כוס'],
        reason: 'קוסקוס (דגן) vs כוס (כלי) - מוצרים שונים',
      },
    ];

    for (const mismatch of categoryMismatches) {
      const [pattern1, pattern2] = mismatch.patterns;

      if (
        (newName.includes(pattern1) && existingName.includes(pattern2)) ||
        (newName.includes(pattern2) && existingName.includes(pattern1))
      ) {
        const isValidVariation = this.isValidProductVariation(
          newName,
          existingName,
        );
        if (!isValidVariation) {
          return {
            isFalsePositive: true,
            reason: mismatch.reason,
          };
        }
      }
    }

    if (newName.includes(existingName) || existingName.includes(newName)) {
      const processingWords = [
        'מיץ',
        'רוטב',
        'ממרח',
        'קמח',
        'שמן',
        'חמאת',
        'עיסת',
      ];
      const freshWords = ['טרי', 'טריים', 'טריות'];

      const newHasProcessing = processingWords.some((word) =>
        newName.includes(word),
      );
      const existingHasProcessing = processingWords.some((word) =>
        existingName.includes(word),
      );
      const newHasFresh = freshWords.some((word) => newName.includes(word));
      const existingHasFresh = freshWords.some((word) =>
        existingName.includes(word),
      );

      if (
        (newHasProcessing && !existingHasProcessing && !existingHasFresh) ||
        (existingHasProcessing && !newHasProcessing && !newHasFresh)
      ) {
        return {
          isFalsePositive: true,
          reason: 'מוצר מעובד vs מוצר טרי - קטגוריות שונות',
        };
      }

      return { isFalsePositive: false };
    }

    if (Math.abs(newName.length - existingName.length) > 5) {
      const similarity = this.calculateSimilarity(newName, existingName);
      if (similarity < 0.4) {
        return {
          isFalsePositive: true,
          reason: `שמות שונים מדי: דמיון של ${Math.round(similarity * 100)}% בלבד`,
        };
      }
    }

    return { isFalsePositive: false };
  }

  private isValidProductVariation(name1: string, name2: string): boolean {
    const commonVariations = [
      'טבעי',
      'אורגני',
      'ביו',
      'טרי',
      'קפוא',
      'מיובש',
      'מתוק',
      'לא מתוק',
      'דל שומן',
      'מלא',
      'חלקי',
      'גדול',
      'קטן',
      'בינוני',
      'ענק',
      'מיני',
    ];

    let core1 = name1;
    let core2 = name2;

    for (const variation of commonVariations) {
      core1 = core1.replace(variation, '').trim();
      core2 = core2.replace(variation, '').trim();
    }

    const similarity = this.calculateSimilarity(core1, core2);
    return similarity > 0.8;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private checkUnitCompatibility(
    newProductName: string,
    existingProduct: Product,
  ): ProductMatch['unitCompatibility'] {
    const preferredUnit = UnitConverter.getPreferredUnit(
      existingProduct.size || 0,
      existingProduct.measureUnit,
      newProductName,
    );

    return {
      compatible: true,
      preferredUnit,
    };
  }

  async mergeProductQuantities(
    existingProduct: Product,
    newProductSize: number,
    newMeasureUnit: MeasureUnit,
    newExpirationDate?: Date,
    isInInventory?: boolean,
  ): Promise<Product> {
    const mergeResult = UnitConverter.mergeQuantities(
      existingProduct.size || 0,
      existingProduct.measureUnit,
      newProductSize,
      newMeasureUnit,
      existingProduct.name,
    );

    if (
      !mergeResult.converted &&
      existingProduct.measureUnit !== newMeasureUnit
    ) {
      console.warn(
        `Failed to convert units for ${existingProduct.name}: ${newMeasureUnit} -> ${existingProduct.measureUnit}`,
      );

      const conversionResult = UnitConverter.convertUnits(
        newProductSize,
        newMeasureUnit,
        existingProduct.measureUnit,
        existingProduct.name,
      );

      if (conversionResult.success) {
        mergeResult.size =
          (existingProduct.size || 0) + conversionResult.convertedSize;
        mergeResult.converted = true;
      } else {
        mergeResult.size = (existingProduct.size || 0) + newProductSize;
      }
    }

    existingProduct.size = mergeResult.size;
    existingProduct.measureUnit = mergeResult.unit;

    if (newExpirationDate) {
      existingProduct.expirationDate = newExpirationDate;
    }

    existingProduct.latestUpdateDate = new Date();
    existingProduct.isInInventory =
      isInInventory ?? existingProduct.isInInventory;

    return await this.productRepository.save(existingProduct);
  }

  checkProductCompatibility(
    existingProduct: Product,
    newProductUnit: MeasureUnit,
    productName?: string,
  ): { compatible: boolean; reason: string; conversionType?: string } {
    const testConversion = UnitConverter.convertUnits(
      1,
      newProductUnit,
      existingProduct.measureUnit,
      productName || existingProduct.name,
    );

    let reason = '';
    if (testConversion.conversionType === 'forced-basic') {
      reason = `Units merged using basic conversion (${testConversion.conversionType})`;
    } else {
      reason = `Units are compatible via ${testConversion.conversionType} conversion`;
    }

    return {
      compatible: true,
      reason,
      conversionType: testConversion.conversionType,
    };
  }

  getConversionPreview(
    fromSize: number,
    fromUnit: MeasureUnit,
    toUnit: MeasureUnit,
    productName: string,
  ): {
    success: boolean;
    convertedSize?: number;
    conversionType?: string;
    explanation?: string;
  } {
    const result = UnitConverter.convertUnits(
      fromSize,
      fromUnit,
      toUnit,
      productName,
    );

    if (result.success) {
      let explanation = '';
      switch (result.conversionType) {
        case 'product-specific':
          explanation = `המרה מותאמת למוצר "${productName}"`;
          break;
        case 'same-category':
          explanation = 'המרה בין יחידות מאותה קטגוריה';
          break;
        case 'density-based':
          explanation = 'המרה על בסיס צפיפות';
          break;
        case 'forced-basic':
          explanation = 'המרה בסיסית (עשויה להיות לא מדויקת)';
          break;
      }

      return {
        success: true,
        convertedSize: result.convertedSize,
        conversionType: result.conversionType,
        explanation,
      };
    }

    return {
      success: false,
      explanation: 'לא ניתן להמיר בין יחידות המידה האלה',
    };
  }
}
