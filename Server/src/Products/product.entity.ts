import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MeasureUnit } from 'src/types';
import { Inventory } from 'src/Inventory/inventory.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Inventory, (inventory) => inventory.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  inventory: Inventory | null;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'float', nullable: true })
  size: number;

  @Column({ type: 'float', nullable: true })
  wantedSize: number;

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

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isChecked: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isInShoppingList: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isInInventory: boolean;
}
