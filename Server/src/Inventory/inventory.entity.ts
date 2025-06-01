import { Product } from 'src/Products/product.entity';
import { ShoppingList } from 'src/ShoppingList/shoppingList.entity';
import { User } from 'src/Users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => User, (user) => user.inventory)
  users: User[];

  @OneToMany(() => Product, (product) => product.inventory)
  products: Product[];

  @OneToOne(() => ShoppingList, (shoppingList) => shoppingList.inventory)
  shoppingList: ShoppingList;
}
