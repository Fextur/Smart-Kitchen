import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Users/user.entity';
import { Recipe } from './recipe.entity';
import { Product } from 'src/Products/product.entity';
import { ProductMatchingModule } from 'src/ProductMatching/productMatching.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Recipe, Product]),
    ProductMatchingModule,
  ],
  controllers: [RecipeController],
  providers: [RecipeService],
})
export class RecipeModule {}
