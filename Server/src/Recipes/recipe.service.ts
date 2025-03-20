import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { GenerateRecipeDto } from './recipe.dto';

@Injectable()
export class RecipeService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generate(products: GenerateRecipeDto[]): Promise<string> {
    try {
      let itemsString = '';
      products.forEach(
        (item) =>
          (itemsString = itemsString.concat(
            `${item.sizeValueLeft} ${item.sizeUnit} of ${item.name} , `,
          )),
      );

      const content = `i have this products: ${itemsString} can you make me a recipe from them, i can buy max three products extra if needed`;
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: content }],
        max_tokens: 1000,
      });

      return (
        response.choices[0].message?.content?.trim() ||
        'Error generating content'
      );
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate content');
    }
  }
}
