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

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value) || 0,
    },
  })
  size: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value) || 0,
    },
  })
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
