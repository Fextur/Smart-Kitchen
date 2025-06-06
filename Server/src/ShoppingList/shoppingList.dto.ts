import { IsArray, IsNotEmpty } from 'class-validator';
import { ProductDto } from 'src/Products/product.dto';

export class CreateShoppingListDto {
  @IsNotEmpty()
  inventoryId: string;

  @IsArray()
  products: ProductDto[];
}
