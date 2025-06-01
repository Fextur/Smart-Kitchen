import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';
import { ProductDto } from 'src/Products/product.dto';

export class CreateShoppingListDto {
  @IsNotEmpty()
  inventoryId: string;

  @IsArray()
  @IsNotEmpty()
  products: ProductDto[];
}
