import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../Users/user.entity';
import { AlertType } from '../types';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AlertType })
  type: AlertType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;
  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  relatedUserId: string; // For alerts involving other users

  @Column({ nullable: true })
  relatedUserName: string;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Additional data specific to alert type
}
