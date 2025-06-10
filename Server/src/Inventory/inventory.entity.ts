import { Product } from 'src/Products/product.entity';
import { User } from 'src/Users/user.entity';
import { Recipe } from 'src/Recipes/recipe.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 7, unique: true, nullable: false })
  @Index({ unique: true })
  kitchenHash: string;

  @OneToMany(() => User, (user) => user.inventory)
  users: User[];

  @OneToMany(() => Product, (product) => product.inventory)
  products: Product[];

  @OneToMany(() => Recipe, (recipe) => recipe.kitchen)
  recipes: Recipe[];
}
