import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MeasureUnit } from 'src/types';
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
  size: number;

  @Column({ type: 'enum', enum: MeasureUnit, nullable: false })
  measureUnit: MeasureUnit;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  expirationDate: Date;

  @Column({
    type: 'timestamptz',
  })
  latestUpdateDate: Date;

  @ManyToOne(() => Inventory, (inventory) => inventory.products, {
    nullable: true,
  })
  inventory: Inventory;

  @ManyToOne(() => ShoppingList, (shoppingList) => shoppingList.products)
  @Exclude()
  shoppingList: ShoppingList;
}
