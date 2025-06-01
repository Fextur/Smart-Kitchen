import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SizeUnit } from 'src/types';
import { Inventory } from 'src/Inventory/inventory.entity';
import { ShoppingList } from 'src/ShoppingList/shoppingList.entity';
import { Exclude } from 'class-transformer';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'float', nullable: false })
  sizeValue: number;

  @Column({ type: 'float', nullable: false })
  sizeValueLeft: number;

  @Column({ type: 'enum', enum: SizeUnit, nullable: false })
  sizeUnit: SizeUnit;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  expirationDate: Date;

  @ManyToOne(() => Inventory, (inventory) => inventory.products, {
    nullable: true,
  })
  inventory: Inventory;

  @ManyToOne(() => ShoppingList, (shoppingList) => shoppingList.products)
  @Exclude()
  shoppingList: ShoppingList;
}
