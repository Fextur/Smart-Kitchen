import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/Users/user.entity';
import { Inventory } from 'src/Inventory/inventory.entity';

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

  // Keep reference to user who created it for audit purposes
  @ManyToOne(() => User, { nullable: true })
  createdBy: User;

  // Now recipes belong to kitchen/inventory instead of user
  @ManyToOne(() => Inventory, (inventory) => inventory.recipes, {
    onDelete: 'CASCADE', // Delete recipes when kitchen is deleted
  })
  kitchen: Inventory;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastAccessedAt: Date;
}

export interface RecipeIngredient {
  productId?: string;
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
