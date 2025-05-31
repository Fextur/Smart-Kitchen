import { Preferences } from './../types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Users/user.entity';
import { GenerateResDto } from './recipe.dto';
import { cleanOpenAIResponse } from 'src/utils';

@Injectable()
export class RecipeService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generate(
    userId: string,
    sensitivities: User['sensitivities'],
    preferences: Preferences[],
  ): Promise<GenerateResDto[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['inventory', 'inventory.products'],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const preferencesString = preferences.join(' , ');
      const sensitivitiesString = sensitivities.join(' , ');

      const productsString = user.inventory.products
        .map((item) => `${item.sizeValueLeft} ${item.sizeUnit} של ${item.name}`)
        .join(' , ');

      const content = `
        יש לי את הרגישויות הבאות: ${sensitivitiesString}.
        יש לי את המצרכים הבאים: ${productsString}.
        אני רוצה שתכין לי JSON של כמה מתכונים שמותאמים להעדפות שלי: ${preferencesString}.
        אפשר להוסיף עד 3 מוצרים נוספים שאינם במלאי שלי, אבל חשוב שתחזיר אותם במבנה הבא:

        [
          {
            "name": "שם המוצר בעברית",
            "sizeValue": מספר שלם (למשל 900),
            "sizeUnit": "גרם" | "קילוגרם" | "ליטר" | "מיליליטר" | "יחידות",
            "expirationDate": null
          },
          ...
        ]
        
        תחזיר את התוצאה בפורמט הבא:
        {
        recipes = [
          {
            recipe = כאן תכתוב את המתכון בפורמט טקסט קריא, עם פסקאות ברורות, שורות מופרדות, וכותרות במידת הצורך. 
                  השתמש בשורות חדשות (\n) ותבליטים כדי שהמתכון יהיה נוח לקריאה.
             extraProducts = כאן תכתוב את רשימת המוצרים בפורמט
            לדוגמא: 
            extraProducts = [
              {
                "name": "שם המוצר בעברית",
                "sizeValue": מספר שלם,
                "sizeUnit": "גרם" | "קילוגרם" | "ליטר" | "מיליליטר" | "יחידות",
                "expirationDate": null
              }
            ]
          }
        ]
        }
        `;
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: content }],
        max_tokens: 1000,
      });

      const resContentRaw = response.choices[0].message?.content?.trim();
      console.log(JSON.stringify(resContentRaw));

      if (!resContentRaw) throw new Error('Failed to generate content');

      const resContent = cleanOpenAIResponse(resContentRaw);

      const recipesArray: GenerateResDto[] = JSON.parse(resContent).recipes;
      console.log({ recipesArray });
      return recipesArray;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate content');
    }
  }
}
