import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/Users/user.entity';

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn('uuid') // מזהה אוטומטי
  id: string;

  @Column({ type: 'text' }) // תוכן המתכון – טקסט חופשי
  content: string;

  @ManyToOne(() => User, (user) => user.recipes, { onDelete: 'CASCADE' })
  user: User;
}
