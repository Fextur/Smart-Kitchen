import { Product } from 'src/Products/product.entity';
import { User } from 'src/Users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @OneToMany(() => User, (user) => user.inventory)
  users: User[];

  @OneToMany(() => Product, (product) => product.inventory)
  products: Product[];
}
