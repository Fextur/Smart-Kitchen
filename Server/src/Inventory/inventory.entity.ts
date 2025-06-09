import { Product } from 'src/Products/product.entity';
import { User } from 'src/Users/user.entity';
import { Recipe } from 'src/Recipes/recipe.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

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

  // Add recipes relation
  @OneToMany(() => Recipe, (recipe) => recipe.kitchen)
  recipes: Recipe[];
}
