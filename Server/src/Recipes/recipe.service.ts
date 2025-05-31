import { Preferences } from './../types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Users/user.entity';

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
  ): Promise<string> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['products'],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const preferencesString = preferences.join(' , ');
      const sensitivitiesString = sensitivities.join(' , ');

      const productsString = user.inventory.products
        .map((item) => `${item.sizeValueLeft} ${item.sizeUnit} של ${item.name}`)
        .join(' , ');

      const content = `יש לי את הרגישויות האלו: ${sensitivitiesString} ויש לי את המצרכים הבאים: ${productsString} ,תכין לי בבקשה מתכון מהמצרכים האלה חשוב לי שהמתכון יהיה ${preferencesString}, ואני מוכן לרכוש אקסטרה 3 מצרכים לכל היותר.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: content }],
        max_tokens: 1000,
      });

      const resContent = response.choices[0].message?.content?.trim();

      if (!resContent) throw new Error('Failed to generate content');

      return resContent;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate content');
    }
  }
}
