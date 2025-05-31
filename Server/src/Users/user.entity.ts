import { Inventory } from 'src/Inventory/inventory.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

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

  @ManyToOne(() => Inventory, (inventory) => inventory.users, {
    onDelete: 'CASCADE',
  })
  inventory: Inventory;
}
