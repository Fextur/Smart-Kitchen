import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './Products/product.module';
import { User } from './Users/user.entity';
import { Product } from './Products/product.entity';
import { UserModule } from './Users/user.module';
import 'dotenv/config';
import { RecipeModule } from './Recipes/recipe.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DATABASE,
      entities: [User, Product],
      synchronize: true,
      autoLoadEntities: true,
    }),
    ProductModule,
    UserModule,
    RecipeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
