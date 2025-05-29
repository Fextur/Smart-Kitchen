import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SizeUnit } from 'src/types';
import { User } from 'src/Users/user.entity';

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

  @ManyToOne(() => User, (user) => user.products, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
