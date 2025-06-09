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
import { MulterModule } from '@nestjs/platform-express';
import { ReceiptScannerModule } from './ReceiptScanner/receiptScanner.module';
import { InventoryModule } from './Inventory/inventory.module';
import { AuthModule } from './Auth/auth.module';
import { ProductMatchingModule } from 'src/ProductMatching/productMatching.module';
import { ShoppingListModule } from './ShoppingList/shoppingList.module';

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
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
    ProductModule,
    UserModule,
    InventoryModule,
    RecipeModule,
    ReceiptScannerModule,
    AuthModule,
    ProductMatchingModule,
    ShoppingListModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
