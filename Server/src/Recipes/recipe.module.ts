import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [RecipeController],
  providers: [RecipeService],
})
export class RecipeModule {}
