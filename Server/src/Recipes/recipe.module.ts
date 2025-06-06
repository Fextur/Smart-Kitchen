import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Users/user.entity';
import { Recipe, RecipeHistory } from './recipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Recipe, RecipeHistory])],
  controllers: [RecipeController],
  providers: [RecipeService],
})
export class RecipeModule {}
