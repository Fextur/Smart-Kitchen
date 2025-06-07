import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { VISION_CLIENT } from '../config/vision.config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/Products/product.entity';
import OpenAI from 'openai';
import { MeasureUnit } from 'src/types';

export interface ParsedProduct {
  name: string;
  size: number;
  measureUnit: MeasureUnit;
  expirationDate: Date | null;
}

export interface ReceiptScanOptions {
  bypassScanning?: boolean;
  mockReceiptText?: string;
  inventoryId?: string;
}

@Injectable()
export class ReceiptScannerService {
  private openai: OpenAI;

  constructor(
    @Inject(VISION_CLIENT)
    private visionClient: ImageAnnotatorClient,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async scanReceipt(
    file: Express.Multer.File,
    options: ReceiptScanOptions = {},
  ): Promise<ParsedProduct[]> {
    if (options.bypassScanning) {
      const mockText =
        options.mockReceiptText || this.getDefaultMockReceiptText();
      return this.parseReceiptWithAI(mockText, options.inventoryId);
    }

    try {
      const [result] = await this.visionClient.textDetection({
        image: { content: file.buffer },
        imageContext: {
          languageHints: ['he', 'iw'],
        },
      });
      const detections = result.textAnnotations;

      if (!detections || detections.length === 0) {
        throw new BadRequestException(
          'No text detected in the receipt image. Please try with a clearer image.',
        );
      }

      const fullText = detections[0].description ?? '';

      return this.parseReceiptWithAI(fullText, options.inventoryId);
    } catch (error) {
      console.error('Error processing receipt:', error);
      throw new BadRequestException(
        `Failed to process receipt: ${error.message}`,
      );
    }
  }

  private async getExistingProducts(inventoryId?: string): Promise<string[]> {
    if (!inventoryId) return [];

    try {
      const existingProducts = await this.productRepository.find({
        where: { inventory: { id: inventoryId } },
        select: ['name'],
      });

      return existingProducts.map((p) => p.name);
    } catch (error) {
      console.error('Error fetching existing products:', error);
      return [];
    }
  }

  private async parseReceiptWithAI(
    receiptText: string,
    inventoryId?: string,
  ): Promise<ParsedProduct[]> {
    try {
      const existingProducts = await this.getExistingProducts(inventoryId);
      const existingProductsText =
        existingProducts.length > 0
          ? `\n\nמוצרים קיימים במלאי: ${existingProducts.join(', ')}`
          : '';

      const prompt = `
      EXPERT HEBREW RECEIPT PARSING WITH ADVANCED MULTI-LINE PRODUCT DETECTION

      CRITICAL MULTI-LINE PRODUCT IDENTIFICATION STRATEGY:
      1. IDENTIFY CONNECTED PRODUCT ENTRIES:
      - Look for CONSECUTIVE lines describing the SAME product
      - Combine product information across multiple lines
      - CRITICAL RULES FOR MULTI-LINE DETECTION:
        * Same product name or very similar names
        * Matching product characteristics
        * Contextually related lines

      2. SPECIFIC MULTI-LINE PARSING EXAMPLES:
      EXAMPLE 1:
      "38000232183 חטיף פרינגלס א 11.90"
      "חטיף פרינגלס אוריגינל 149 ג"
      → MERGE INTO ONE PRODUCT: 
        {
          "name": "חטיף פרינגלס אוריגינל",
          "size": 149,
          "measureUnit": "גרם",
          "expirationDate": null
        }

      EXAMPLE 2:
      "5701932026971 הוטפופ חמאה 00 15.90"
      "הוטפופ 500-600 גר ב 14.90"
      → MERGE INTO ONE PRODUCT:
        {
          "name": "הוטפופ חמאה",
          "size": 500,
          "measureUnit": "גרם",
          "expirationDate": null
        }

      3. PRODUCT LINE CONSOLIDATION GUIDELINES:
      - Prioritize COMPLETE product information
      - Use context to fill in missing details
      - Prefer more descriptive product names
      - Combine size information from adjacent lines

      4. EXISTING PRODUCTS MATCHING:
      - Try to match scanned products with existing inventory items
      - Use similar or exact names when possible
      - Prefer existing product names for consistency
      ${existingProductsText}

      SCANNING CONTEXT:
      - Receipt is from OCR scan
      - Expect potential text recognition errors
      - Focus on intelligent information reconstruction

      OUTPUT FORMAT:
      {
        "products": [
          {
            "name": "מלא שם המוצר בעברית",
            "size": 900,
            "measureUnit": "גרם/ליטר/קילוגרם",
            "expirationDate": null
          }
        ]
      }

      RECEIPT TEXT:
      ${receiptText}
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an ADVANCED HEBREW RECEIPT PARSING EXPERT.
            CRITICAL MISSION: Reconstruct COMPLETE product information
            from fragmented, multi-line receipt entries.
            Use MAXIMUM INTELLIGENCE to connect related product lines.
            Try to match products with existing inventory when possible.
            Generate a COMPREHENSIVE, ACCURATE JSON object.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.2,
      });

      const responseContent = response.choices[0].message?.content?.trim();

      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      const parsedResponse = JSON.parse(responseContent);

      if (!parsedResponse.products || !Array.isArray(parsedResponse.products)) {
        console.error('Invalid response structure:', parsedResponse);
        throw new Error('Invalid response structure from AI');
      }

      const processedProducts = parsedResponse.products.map((product) => ({
        name: product.name?.trim() || 'Unknown Product',
        size: Number(product.size) || 0,
        measureUnit: this.validateMeasureUnit(product.measureUnit),
        expirationDate: null,
      }));

      return processedProducts;
    } catch (error) {
      console.error('Error parsing receipt with AI:', error);

      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      return [];
    }
  }

  private getDefaultMockReceiptText(): string {
    return `
      קשת טעמים ראשלצ מערב הלחי 4 רשלצ
      ח.פ. 513238402
      טל: 03-6402260
      מנהל הסניף: יבגני ברניק
      חשבון/קבלה 00240305043036
      * * *  מקור * * *
      קוד/מחלקה ...... תאור ..................... סכום
      38000232183 חטיף פרינגלס א 11.90
      חטיף פרינגלס אוריגינל 149 ג 3.00-
      5701932026971 הוטפופ חמאה 00 15.90
      הוטפופ 500-600 גר ב 14.90 1.00-
      26
      פלפל אדום
      7.90 x 0.265 ק"ג 2.09
      x
      טחון בשר עגל טרי
      17618
      * ק"ג
      פלפל חריף ירוק
      ק"ג
      38.22 "p 0.638 x 59.90
      25
      0.28 "p 0.035 x 7.90
      בצל יבש
      31
      1.98 x"p 0.335 x 5.90
      אבישי גל
      מזל טוב ליום הולדתך
      לקוח: 017) * י *
      שקיות גופייה מ 0.10
      11111
      0.00
      יתרת חשבון (פתיחה)
    `;
  }

  private validateMeasureUnit(unit: string): MeasureUnit {
    const unitMappings = {
      גרם: MeasureUnit.GRAM,
      'גר׳': MeasureUnit.GRAM,
      קילוגרם: MeasureUnit.KILOGRAM,
      'ק״ג': MeasureUnit.KILOGRAM,
      ליטר: MeasureUnit.LITER,
      'ל׳': MeasureUnit.LITER,
      מיליליטר: MeasureUnit.MILLILITER,
      'מ״ל': MeasureUnit.MILLILITER,
    };

    return unitMappings[unit] || MeasureUnit.GRAM;
  }
}
