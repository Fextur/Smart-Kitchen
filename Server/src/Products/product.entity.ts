import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SizeUnit } from 'src/types';
import { Inventory } from 'src/Inventory/inventory.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid', { name: 'product_id' })
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
    nullable: false,
    onDelete: 'CASCADE',
  })
  inventory: Inventory;
}
