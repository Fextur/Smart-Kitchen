// recipe.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/Users/user.entity';

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('json')
  ingredients: RecipeIngredient[];

  @Column('json')
  steps: RecipeStep[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 30 })
  totalTimeMinutes: number;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => RecipeHistory, (history) => history.recipe)
  history: RecipeHistory[];
}

@Entity()
export class RecipeHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.history)
  recipe: Recipe;

  @ManyToOne(() => User)
  user: User;

  @Column()
  servingsUsed: number;

  @Column({ default: false })
  completed: boolean;

  @Column({ default: false })
  addedMissingToShoppingList: boolean;

  @CreateDateColumn()
  accessedAt: Date;
}

export interface RecipeIngredient {
  name: string;
  baseAmount: number;
  perServingAmount: number;
  unit: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  isTimerStep: boolean;
  timerMinutes?: number;
}
