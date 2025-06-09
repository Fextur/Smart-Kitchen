import { Inventory } from 'src/Inventory/inventory.entity';
import { Recipe } from 'src/Recipes/recipe.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false, name: 'user_name' })
  userName: string;

  @Column({ type: 'text', nullable: false })
  email: string;

  @Column({ type: 'text', nullable: false })
  password: string;

  @Column({ type: 'text', array: true, default: [] })
  sensitivities: string[];

  @Column({ type: 'float', nullable: true })
  height: number;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ type: 'text', nullable: true })
  goal: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Inventory, (inventory) => inventory.users, {
    onDelete: 'CASCADE',
  })
  inventory: Inventory;

  @OneToMany(() => Recipe, (recipe) => recipe.createdBy)
  createdRecipes: Recipe[];
}
