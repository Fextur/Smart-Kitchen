import { Product } from 'src/Products/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  id: string;

  @Column({ type: 'text', nullable: false })
  name: string;

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];
}
