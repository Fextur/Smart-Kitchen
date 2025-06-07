// Server/src/ProductMatching/productMatching.service.ts - Updated with simple unit conversion
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
    אתה מומחה בזיהוי מוצרי מזון והתאמתם.
    
    רשימת מוצרים קיימים במלאי:
    ${existingProductsList}
    
    מוצרים חדשים לבדיקה:
    ${newProductNames.join(', ')}
    
    עבור כל מוצר חדש, בדוק אם יש מוצר קיים שמתאים לו.
    
    כללי התאמה:
    1. שמות דומים או זהים (לדוגמה: "בצל יבש" ו"בצל")
    2. מוצרים מאותה קטגוריה (לדוגמה: "הוטפופ חמאה" ו"פופקורן")
    3. שמות מקוצרים או מלאים של אותו מוצר
    4. שמות עם מותגים שונים לאותו מוצר
    5. **יחידות מידה שונות של אותו מוצר (לדוגמה: חלב בליטר וחלב במיליליטר)**
    
    רמות ביטחון:
    - high: התאמה ברורה (99% בטחון)
    - medium: התאמה סבירה (70-90% בטחון)
    - low: התאמה אפשרית (40-70% בטחון)
    - none: אין התאמה (פחות מ-40% בטחון)
    
    החזר תוצאה בפורמט JSON הבא:
    {
      "matches": [
        {
          "productName": "שם המוצר החדש",
          "matchedProductName": "שם המוצר הקיים שמתאים" או null,
          "confidence": "high/medium/low/none",
          "reason": "הסבר קצר למה יש או אין התאמה"
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
              'אתה מומחה בזיהוי והתאמת מוצרי מזון. תחזיר תמיד JSON תקין. זהה מוצרים זהים גם עם יחידות מידה שונות.',
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

        if (match.matchedProductName && match.confidence !== 'none') {
          matchedProduct =
            existingProducts.find((p) => {
              const exactMatch = p.name === match.matchedProductName;
              const containsMatch =
                match.matchedProductName.includes(p.name) ||
                p.name.includes(match.matchedProductName);

              return exactMatch || containsMatch;
            }) || null;
        }

        return {
          productName: match.productName,
          matchedProduct,
          confidence: match.confidence,
          reason: match.reason,
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

  /**
   * Merge product quantities with smart unit conversion
   */
  async mergeProductQuantities(
    existingProduct: Product,
    newProductSize: number,
    newMeasureUnit: MeasureUnit,
    newExpirationDate?: Date,
    isInInventory?: boolean,
  ): Promise<Product> {
    // Use the simple unit converter
    const mergeResult = UnitConverter.mergeQuantities(
      existingProduct.size || 0,
      existingProduct.measureUnit,
      newProductSize,
      newMeasureUnit,
      existingProduct.name,
    );

    // Update the product
    existingProduct.size = mergeResult.size;

    // Only change unit if conversion was successful and resulted in a different unit
    if (
      mergeResult.converted &&
      mergeResult.unit !== existingProduct.measureUnit
    ) {
      existingProduct.measureUnit = mergeResult.unit;
    }

    if (newExpirationDate) {
      existingProduct.expirationDate = newExpirationDate;
    }

    existingProduct.latestUpdateDate = new Date();
    existingProduct.isInInventory =
      isInInventory ?? existingProduct.isInInventory;

    return await this.productRepository.save(existingProduct);
  }

  /**
   * Check if products can be merged based on unit compatibility
   */
  checkProductCompatibility(
    existingProduct: Product,
    newProductUnit: MeasureUnit,
    productName?: string,
  ): { compatible: boolean; reason: string } {
    const compatible = UnitConverter.areUnitsCompatible(
      existingProduct.measureUnit,
      newProductUnit,
      productName || existingProduct.name,
    );

    return {
      compatible,
      reason: compatible
        ? 'Units are compatible and can be merged'
        : 'Units are not compatible for this product type',
    };
  }
}
