import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;
}

export class UpdateInventoryDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
